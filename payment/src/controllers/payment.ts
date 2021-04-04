import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { asyncMiddleware } from "../common/asyncMiddleware";
import { ErrorResponse } from "../common/globalError";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import queryString from "query-string";
import { sendOrderUpdated, sendUserUpdated } from "../messages/publishers";
import { CommonFeatures } from "../common/commonFeatures";

const stripe = new Stripe(
  // @ts-ignore
  // Enter your key -> in future help chart will be used to hide env varoables -> This key will not work for you as it's temporary
  "sk_test_51HfpdrKPpizShHGu1jd14dChd8rxn3tgPWvvIIoy2QKveoBIDY204zovW02OkLcHZn6LANBBsPf7m1YTYl3xbfXi00NFVsh8aS",
  {
    apiVersion: "2020-08-27",
  }
);

// Stripe
// SetUp Seller (Content Creator)
export const createConnectAccount = asyncMiddleware(
  async (req: Request, res: Response) => {
    // 1. find user
    const user = await User.findById(req.user._id).exec();

    // 2. if user don't have stripeAccountId yet, create now
    // India only support 'standard' connect account! (Other contries does support express and custom type, visit doc and follow)
    if (!user?.stripeAccountId) {
      const account = await stripe.accounts.create({
        // country: "IN",
        type: "standard",
        // capabilities: {
        //   card_payments: {
        //     requested: true,
        //   },
        //   transfers: {
        //     requested: true,
        //   },
        // },
      });
      user!.stripeAccountId = account.id;
      await user!.save();
      if (user) {
        sendUserUpdated(user);
      }
    }
    // 3. create login link based on account id (for frontend to complete onboarding)
    let accountLink = await stripe.accountLinks.create({
      account: user?.stripeAccountId!,
      refresh_url: `${req.headers.origin}/account`,
      return_url: `${req.headers.origin}/account`,
      type: "account_onboarding",
    });

    // prefill any info (Only work with custom and express, in India it'll not work :( )
    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user!.email || undefined,
    });

    let link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
    res.send(link);
  }
);

export const stripeSession = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1 get hotel id from req.body
    const { orderId } = req.body;

    // 2 find the hotel based on hotel id from db
    const order = await Order.findById(orderId)
      .populate({
        path: "customer",
        model: "User",
        select: { password: 0 },
      })
      .populate({
        path: "dropIn",
        model: "DropIn",
        populate: {
          path: "creator",
          model: "User",
          select: { password: 0 },
        },
      });

    if (order && order.dropIn) {
      // 3 20% charge as application fee
      // @ts-ignore
      const fee = (order.dropIn?.dropPrice! * 20) / 100;

      // 4 create a session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        // 5 purchasing item details, it will be shown to user on checkout
        line_items: [
          {
            // @ts-ignore
            name: order.dropIn?.name,
            // @ts-ignore
            amount: order.dropIn?.dropPrice! * 100, // in cents
            currency: "inr",
            quantity: 1,
          },
        ],
        payment_intent_data: {
          // 20% commision, 80% to seller
          application_fee_amount: fee * 100,
          transfer_data: {
            // @ts-ignore
            destination: order.dropIn?.creator?.stripeAccountId!,
          },
        },
        success_url: `${req.headers.origin}/stripe-success/${orderId}`,
        cancel_url: `${req.headers.origin}`,
      });

      // 7 add this session object to user in the db
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          stripeSession: session,
        },
        { new: true }
      );

      // 8 Broadcast to user service
      if (updatedUser) {
        await sendUserUpdated(updatedUser);
      }

      // 9 send session id as resposne to frontend
      res.send({
        success: true,
        data: {
          sessionId: session.id,
          successOrderId: order._id,
        },
      });
    } else {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }
  }
);

export const stripeSignedInUserAccountStatus = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id).exec();
    if (user && user.stripeAccountId) {
      const account = await stripe.accounts.retrieve(user?.stripeAccountId);
      res.json({ success: true, data: account });
    } else {
      return next(
        new ErrorResponse(`Bad request, no account for this user is found`, 401)
      );
    }
  }
);

export const stripeSessionSuccess = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find Order to make it 'completed'
    const { orderId } = req.body;

    const user = await User.findById(req.user._id).exec();
    if (!user?.stripeSession) {
      return next(
        new ErrorResponse(`Session for this order has expired !`, 401)
      );
    }

    // 3 retrieve stripe session, based on session id we previously save in user db
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );

    // 4 if session payment status is paid, create order
    if (session.payment_status === "paid") {
      // 5 check if order with that session id already exist by querying orders collection
      const orderExist = await Order.findById(orderId).exec();

      if (orderExist) {
        // remove user/signedInUser(buyer)'s session
        user.stripeSession = null;

        // send updated user to other services
        const updatedUser = await user.save();
        if (updatedUser) {
          await sendUserUpdated(updatedUser);
        }

        // updated order status
        orderExist!.status = "completed";
        const updatedOrder = await orderExist.save();

        // send order completed to other services
        if (updatedOrder) {
          await sendOrderUpdated(updatedOrder);
        }

        // Make DB entry of payment for future record
        const payment = await Payment.create({
          buyer: updatedUser._id,
          order: updatedOrder._id,
          paymentId: session.payment_intent,
        });

        res.json({ success: true, data: payment });
      } else {
        return next(new ErrorResponse(`Order update failed`, 401));
      }
    }
  }
);

// Payments (After stripeSuccess call below fn)
export const paymentInsert = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    // paymentId === payment_intent
    const { paymentId, order } = req.body;

    const orderData = await Order.findOne({ _id: order }).exec();

    if (!orderData) {
      return next(new ErrorResponse(`No order for payment found`, 400));
    }

    const buyer = req.user._id;
    if (!paymentId || !order || !orderData || !buyer) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }

    const payment = await Payment.create({
      buyer,
      order,
      paymentId,
    });

    return res.status(200).send({
      status: "success",
      payment,
    });
  }
);

export const getBySingedInUserId = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const buyer = req.user._id;
    if (!buyer) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }

    const paymentCommonFeatures = new CommonFeatures(
      Payment.find({
        buyer,
      })
        .populate({
          path: "buyer",
          model: "User",
          select: { password: 0 },
        })
        .populate("order")
        .exec(),
      req.query
    )
      .select()
      .paginate()
      .filter()
      .sort();
    const userPayments = await paymentCommonFeatures.query;

    return res.status(200).send({
      status: "success",
      order: userPayments,
    });
  }
);

export const getBySingedInUserBalance = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    if (!userId) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }

    const user = await User.findById(userId).exec();

    const balance = await stripe.balance.retrieve({
      stripeAccount: user?.stripeAccountId,
    });

    return res.status(200).send({
      status: "success",
      data: balance,
    });
  }
);

export const getAllPayments = asyncMiddleware(
  async (req: Request, res: Response) => {
    const paymentCommonFeatures = new CommonFeatures(
      Payment.find().exec(),
      req.query
    )
      .select()
      .paginate()
      .filter()
      .sort();
    const payments = await paymentCommonFeatures.query;

    res.status(200).send({
      status: "success",
      data: payments,
    });
  }
);

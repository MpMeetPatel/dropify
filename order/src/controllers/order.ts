import { NextFunction, Request, Response } from "express";
import { asyncMiddleware } from "../common/asyncMiddleware";
import { CommonFeatures } from "../common/commonFeatures";
import { ErrorResponse } from "../common/globalError";
import { sendOrderCreated, sendOrderDeleted } from "../messages/publishers";
import { Order, OrderStatus } from "../models/Order";

export const orderInsert = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { dropIn } = req.body;

    const customer = req.user._id;
    if (!dropIn || !customer) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }

    const order = await Order.create({
      status: OrderStatus.CREATED,
      customer,
      dropIn,
    });

    // Broadcast to other services
    if (order) {
      await sendOrderCreated(order);
    }

    return res.status(200).send({
      status: "success",
      data: order,
    });
  }
);

export const getBySingedInUserId = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user._id;
    if (!customer) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }
    const count = await Order.countDocuments({ customer });
    const orderCommonFeatures = new CommonFeatures(
      Order.find({
        customer,
      })
        .populate({
          path: "customer",
          model: "User",
          select: { password: 0 },
        })
        .populate("dropIn"),
      req.query
    )
      .select()
      .paginate()
      .filter()
      .sort();
    const userOrders = await orderCommonFeatures.query;

    return res.status(200).send({
      status: "success",
      data: userOrders,
      count,
    });
  }
);

export const getSingedInUserOrderById = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id = null } = { ...req.body, ...req.params };

    if (!id) {
      return next(new ErrorResponse(`Provide valid order id`, 400));
    }

    const userOrder = await Order.findById(id)
      .populate({
        path: "customer",
        model: "User",
        select: { password: 0 },
      })
      .populate("dropIn")
      .exec();

    let userDropInObject = userOrder?.toObject();

    // @ts-ignore
    if (req.user._id !== userDropInObject?.customer.id) {
      // @ts-ignore
      delete userDropInObject?.dropIn.audio;
      // @ts-ignore
      delete userDropInObject?.dropIn.video;
    }

    return res.status(200).send({
      status: "success",
      data: userDropInObject,
    });
  }
);

export const getSingedInUserOrderByDropInId = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { dropInId = null } = { ...req.body, ...req.params };

    if (!dropInId) {
      return next(new ErrorResponse(`Provide valid order id`, 400));
    }

    let userOrder = await Order.findOne({
      dropIn: dropInId,
      customer: req.user._id,
    }).exec();

    if (userOrder && userOrder.status === "completed") {
      userOrder = await Order.findOne({
        dropIn: dropInId,
        customer: req.user._id,
      })
        .populate("dropIn")
        .exec();
    }

    if (userOrder) {
      return res.status(200).send({
        status: "success",
        data: userOrder,
      });
    } else {
      return next(new ErrorResponse(`No order found`, 404));
    }
  }
);

export const getBySingnedInUserAndDelete = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const creator = req.user._id;
    if (!creator) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }

    const order = await Order.findOne({ _id: req.params.orderId }).exec();

    if (!order) {
      res.status(400).send("Order not found");
      return;
    }

    await order.remove();

    await sendOrderDeleted(order._id);

    res.status(201).send({
      status: "success",
      data: {
        message: `Order with id: ${order._id} deleted successfully`,
      },
    });
  }
);

export const getAllOrders = asyncMiddleware(
  async (req: Request, res: Response) => {
    const count = await Order.countDocuments();
    const orderCommonFeatures = new CommonFeatures(
      Order.find()
        .populate({
          path: "creator",
          model: "User",
          select: { password: 0 },
        })
        .populate({
          path: "dropIn",
          model: "DropIn",
        }),
      req.query
    )
      .select()
      .paginate()
      .filter()
      .sort();
    const orders = await orderCommonFeatures.query;

    res.status(200).send({
      status: "success",
      data: orders,
      count,
    });
  }
);

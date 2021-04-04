import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { asyncMiddleware } from "../common/asyncMiddleware";
import { CommonFeatures } from "../common/commonFeatures";
import { generateUserToken } from "../common/generateJWT";
import { ErrorResponse } from "../common/globalError";
import { sendEmail } from "../common/sendMail";
import { sendUserCreated, sendUserUpdated } from "../messages/publishers";
import { User } from "../models/User";

export const signUpUser = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      firstName,
      lastName,
      email,
      userName,
      password,
      role,
      profilePic,
    } = req.body;
    if (!email || !password || !userName || !firstName || !lastName) {
      return next(new ErrorResponse(`Please provide required data`, 400));
    }
    // create is class/function constructor method
    // save/insert is instace method
    const newUser = await User.create({
      email,
      firstName,
      lastName,
      userName,
      password,
      role,
      profilePic: profilePic || null,
      stripeAccountId: null,
      stripeAccount: null,
      stripeSession: null,
    });

    res.status(201).send({
      status: "success",
      data: {
        user: newUser,
      },
    });

    // Broadcast to all other services
    if (newUser) {
      await sendUserCreated(newUser);
    }
  }
);

// Not needed right now, all handling are done in via browser cookie API
export const signOutUser = asyncMiddleware(
  async (_: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).send({ msg: "token cookies has been removed!" });
  }
);

export const signInUser = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, userName } = req.body;
    if (!(email || userName) || !password) {
      return next(new ErrorResponse(`enter email/userName and password`, 400));
    }

    const user = await User.findOne({
      $or: [{ email }, { userName }],
    })
      .select("+password")
      .exec();

    if (!user || !(await user.correctPassword(user.password, password))) {
      return next(new ErrorResponse(`Invalid email or password`, 401));
    }

    const token = await generateUserToken(user._id);

    res.status(200).send({
      status: "success",
      token,
    });
  }
);

export const getSignedInUser = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (await User.findById(req.user._id).exec()) || null;

    if (!user) {
      return next(new ErrorResponse(`No user found`, 401));
    }

    return res.status(200).send({
      status: "success",
      data: user,
    });
  }
);

export const forgotPassword = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) get user based on email
    const user = await User.findOne({ email: req.body.email }).exec();

    if (!user) {
      return next(new ErrorResponse(`user not found`, 404));
    }

    // 2) generate passwordReset Token;
    const resetToken = user.generatePasswordToken();
    await user.save({ validateBeforeSave: false });

    // 3) send it to use via mail
    const resetURL = `${req.headers.origin}/reset-password/${resetToken}`;

    const message = `forgot password ? please reset your password using this link: ${resetURL}, click below url or enter manually :)`;

    try {
      await sendEmail({
        to: user.email,
        subject: "reset password(in 10 min token will be expires)",
        text: message,
        html: `<a href="${resetURL}" target="_blank">Reset password here</a>`,
      });
      return res.send({ msg: "Token send to email !" });
    } catch (error) {
      // make sure if sending mail fail, then empty the password_reset_token & password_reset_expiry
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorResponse(`Internal server error`, 500));
    }
  }
);

export const resetPassword = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hashRecievedResetToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashRecievedResetToken,
      passwordResetExpiry: { $gt: Date.now() },
    }).exec();

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new ErrorResponse(`Token is invalid or expired`, 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    const updatedUser = await user.save();

    // 3) Update changedPasswordAt property for the user
    ///////  ==> // this is done automatically as user schema has instace method for preSave doc

    sendUserUpdated(updatedUser);

    return res.status(200).send({
      status: "success",
    });
  }
);

export const updateSingedInUser = asyncMiddleware(
  async (req: Request, res: Response) => {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    }).exec();

    // Broadcast to all other services
    if (updatedUser) {
      await sendUserUpdated(updatedUser);
    }

    return res.status(200).send({
      status: "success",
      data: updatedUser,
    });
  }
);

export const allowPermissionTo = (...roles: string[]) => {
  // roles = ["user","manager","admin", ...etc] , role="user" || "manager" || "admin"
  // roles = ["user","manager"] , role="user" || "manager"
  return (req: Request, _: Response, next: NextFunction) => {
    if (req.user.role && !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`user don't have permision to perform this task`, 403)
      );
    }
    next();
  };
};

export const getAllUsers = asyncMiddleware(
  async (req: Request, res: Response) => {
    const userCommonFeatures = new CommonFeatures(User.find().exec(), req.query)
      .select()
      .paginate()
      .filter()
      .sort();
    const users = await userCommonFeatures.query;

    res.status(200).send({
      status: "success",
      data: users,
    });
  }
);

export const deleteUser = asyncMiddleware(
  async (req: Request, res: Response) => {
    const user = await User.findOne({ _id: req.params.userId }).exec();

    if (!user) {
      res.status(400).send("User not found");
      return;
    }

    if (user.role === "admin") {
      res.status(400).send("Admin can't be deleted");
      return;
    }

    await user.remove();

    res.status(201).send({
      status: "success",
      data: {
        message: `User with id: ${user._id} deleted successfully`,
      },
    });
  }
);

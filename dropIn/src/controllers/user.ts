import { NextFunction, Request, Response } from "express";
import { asyncMiddleware } from "../common/asyncMiddleware";
import { CommonFeatures } from "../common/commonFeatures";
import { ErrorResponse } from "../common/globalError";
import { User } from "../models/User";

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
    const userCommonFeatures = new CommonFeatures(User.find(), req.query)
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
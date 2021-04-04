import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { asyncMiddleware } from "./asyncMiddleware";
import { ErrorResponse } from "./globalError";
import { User } from "../models/User";

export const authenticateUser = asyncMiddleware(
  async (req: Request, _: Response, next: NextFunction) => {
    // 1) check authToken is provided in header
    const token = req.headers.authorization

    if (!token) {
      return next(
        new ErrorResponse("you're not logged in, please login !", 401)
      );
    }

    // 2) varify token
    const decoded = await promisify(jwt.verify)(
      token,
      // @ts-ignore
      process.env.SECRET || "jwt-secret"
    );

    // 3) Check user still exists
    // @ts-ignore
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new ErrorResponse("token expired or user doesn't exists", 401)
      );
    }

    // 4) check password is changes after signin
    // @ts-ignore
    if (currentUser.isPasswordChangedAfterSignIn(decoded.iat)) {
      return next(
        new ErrorResponse(
          "you've changed password !, Enter latest password",
          400
        )
      );
    }

    req.user = currentUser;

    next();
  }
);

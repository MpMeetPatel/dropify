import { Request, Response } from "express";
import { asyncMiddleware } from "../common/asyncMiddleware";
import { CommonFeatures } from "../common/commonFeatures";
import { Order } from "../models/Order";

export const getAllOrders = asyncMiddleware(
  async (req: Request, res: Response) => {
    const orderCommonFeatures = new CommonFeatures(
      Order.find()
        .populate({
          path: "customer",
          model: "User",
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
    });
  }
);
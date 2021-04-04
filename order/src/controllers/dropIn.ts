import { Request, Response } from "express";
import { asyncMiddleware } from "../common/asyncMiddleware";
import { CommonFeatures } from "../common/commonFeatures";
import { DropIn } from "../models/DropIn";

export const getAllDropIns = asyncMiddleware(
  async (req: Request, res: Response) => {
    const dropInCommonFeatures = new CommonFeatures(
      DropIn.find().populate("creator"),
      req.query
    )
      .select()
      .paginate()
      .filter()
      .sort();
    const dropIns = await dropInCommonFeatures.query;

    res.status(200).send({
      status: "success",
      data: dropIns,
    });
  }
);

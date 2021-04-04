import { NextFunction, Request, Response } from "express";
import { asyncMiddleware } from "../common/asyncMiddleware";
import { CommonFeatures } from "../common/commonFeatures";
import { ErrorResponse } from "../common/globalError";
import {
  sendDropInCreated,
  sendDropInDeleted,
  sendDropInUpdated,
} from "../messages/publishers";
import { DropIn, Status } from "../models/DropIn";

export const dropInInsert = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      status,
      description,
      thumbnail,
      audioPreview,
      audio,
      videoPreview,
      video,
      dropCost,
      dropPrice,
    } = req.body;

    const creator = req.user._id;
    if (!name || !dropCost || !creator) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }

    const dropIn = await DropIn.create({
      name: name,
      status: status || Status.APPROVED,
      thumbnail,
      description,
      audioPreview: audioPreview || null,
      audio: audio || null,
      videoPreview: videoPreview || null,
      video: video || null,
      dropCost,
      dropPrice: dropPrice || null,
      creator,
    });

    // Broadcast to other services
    if (dropIn) {
      await sendDropInCreated(dropIn);
    }

    return res.status(200).send({
      status: "success",
      data: dropIn,
    });
  }
);

export const getBySingedInUserId = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const creator = req.user._id;
    if (!creator) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }

    const count = await DropIn.countDocuments({ creator });

    const dropInCommonFeatures = new CommonFeatures(
      DropIn.find({
        creator,
      })
        .select("+audio +video")
        .populate({
          path: "creator",
          model: "User",
          select: { password: 0 },
        }),
      req.query
    )
      .select()
      .paginate()
      .filter()
      .sort();
    const userDropIns = await dropInCommonFeatures.query;

    return res.status(200).send({
      status: "success",
      data: userDropIns,
      count,
    });
  }
);

export const getSingedInUserDropIn = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id = null } = { ...req.body, ...req.params };

    if (!id) {
      return next(new ErrorResponse(`Provide valid dropin id`, 400));
    }

    let userDropIn = await DropIn.findById(id)
      .select("+audio +video")
      .populate({
        path: "creator",
        model: "User",
        select: { password: 0 },
      })
      .exec();

    let userDropInObject = userDropIn?.toObject();

    // @ts-ignore
    if (req.user._id !== userDropInObject?.creator._id) {
      delete userDropInObject?.audio;
      delete userDropInObject?.video;
    }

    return res.status(200).send({
      status: "success",
      data: userDropInObject,
    });
  }
);

export const getBySingnedInUserAndDelete = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const creator = req.user._id;

    if (!creator) {
      return next(new ErrorResponse(`Provide valid data`, 400));
    }

    const userDropIn = await DropIn.findOne({
      _id: req.params.dropInId,
    }).exec();

    if (!userDropIn) {
      res.status(400).send("DropIn not found");
      return;
    }

    await userDropIn.remove();

    if (userDropIn._id) {
      await sendDropInDeleted(userDropIn._id);
    }

    res.status(201).send({
      status: "success",
      data: {
        message: `DropIn with id: ${userDropIn._id} deleted successfully`,
      },
    });
  }
);

export const getAllDropIns = asyncMiddleware(
  async (req: Request, res: Response) => {
    const count = await DropIn.countDocuments();
    const dropInCommonFeatures = new CommonFeatures(
      DropIn.find().populate({
        path: "creator",
        model: "User",
        select: { password: 0 },
      }),
      req.query
    )
      .select()
      .paginate()
      .filter()
      .sort();
    let dropIns = await dropInCommonFeatures.query;

    res.status(200).send({
      status: "success",
      data: dropIns,
      count,
    });
  }
);

export const getByNameSearch = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { searchTerm = "" } = req.body;

    if (searchTerm && searchTerm.length <= 0) {
      return next(new ErrorResponse(`Please provide searchTerm`, 400));
    }

    const dropInCommonFeatures = new CommonFeatures(
      DropIn.find({ $text: { $search: searchTerm } }),
      req.query
    )
      .select()
      .paginate()
      .filter()
      .sort();
    let dropIns = await dropInCommonFeatures.query;

    res.status(200).send({
      status: "success",
      data: dropIns,
    });
  }
);

export const updateDropInById = asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    const { audio, audioPreview } = req.body;
    // if (!name || !description) {
    //   return next(new ErrorResponse(`Provide valid update data`, 400));
    // }

    const updatedDropIn = await DropIn.findByIdAndUpdate(
      req.params.dropInId,
      // req.body,
      { $set: { audio, audioPreview } },
      { new: true }
    );

    // send to other services
    if (updatedDropIn) {
      await sendDropInUpdated(updatedDropIn);
    }

    res.send({
      success: true,
      data: updatedDropIn,
    });
  }
);

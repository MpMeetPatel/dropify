import mongoose, { Document, model, Model, Schema } from "mongoose";
import { IUser } from "./User"

export enum Status {
  PENDING = "pending",
  APPROVED = "approved",
}

enum DropCost {
  PAID = "paid",
  FREE = "free",
}

export interface IDropIn extends Document {
  name: string;
  description?: string;
  status: string;
  thumbnail?: string;
  audioPreview?: string;
  audio?: string;
  videoPreview?: string;
  video?: string;
  dropCost: string;
  dropPrice?: number;
  creator: mongoose.Types.ObjectId;
}

const DropInSchema: Schema = new Schema(
  {
    name: { type: String, required: true, min: 2, unique: true },
    description: { type: String },
    status: { type: String, enum: Status, required: true },
    thumbnail: { type: String },
    audioPreview: { type: String },
    audio: { type: String, select: false },
    videoPreview: { type: String },
    video: { type: String, select: false },
    dropCost: { type: String, enum: DropCost, required: true },
    dropPrice: { type: Number },
    creator: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

DropInSchema.index({ name: "text" });

export const DropIn: Model<IDropIn> = model("DropIn", DropInSchema);

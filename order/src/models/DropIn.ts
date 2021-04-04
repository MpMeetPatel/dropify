import mongoose, { Document, model, Model, Schema } from "mongoose";

enum Status {
  PENDING = "pending",
  APPROVED = "approved",
}

enum DropCost {
  PAID = "paid",
  FREE = "free",
}

interface IDropIn extends Document {
  name: string;
  description?: string;
  status: string;
  thumbnail?: string;
  dropCost: string;
  dropPrice?: number;
  audioPreview?: string;
  audio?: string;
  videoPreview?: string;
  video?: string;
  creator: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const DropInSchema: Schema = new Schema({
  name: { type: String, required: true, min: 2, unique: true },
  description: { type: String },
  status: { type: String, enum: Status, required: true },
  thumbnail: { type: String },
  audioPreview: { type: String },
  audio: { type: String },
  videoPreview: { type: String },
  video: { type: String },
  dropCost: { type: String, enum: DropCost, required: true },
  dropPrice: { type: Number },
  creator: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  createdAt: Date,
  updatedAt: Date,
});

export const DropIn: Model<IDropIn> = model("DropIn", DropInSchema);

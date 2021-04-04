import mongoose, { Document, model, Model, Schema } from "mongoose";

export enum OrderStatus {
  CREATED = "created",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface IOrder extends Document {
  status: string;
  customer: mongoose.Types.ObjectId;
  dropIn: mongoose.Types.ObjectId;
}

const OrderSchema: Schema = new Schema(
  {
    status: { type: String, enum: OrderStatus, required: true },
    customer: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    dropIn: { type: mongoose.Types.ObjectId, ref: "DropIn", required: true },
  },
  { timestamps: true }
);

OrderSchema.index({ customer: 1, dropIn: 1 }, { unique: true });

export const Order: Model<IOrder> = model("Order", OrderSchema);

import mongoose, { Document, model, Model, Schema } from "mongoose";

interface IPayment extends Document {
  extra?: any;
  order: mongoose.Types.ObjectId;
  paymentId: string;
  user: string;
}

const PaymentSchema: Schema = new Schema(
  {
    extra: { type: Object },
    order: { type: mongoose.Types.ObjectId, ref: "Order", required: true },
    paymentId: { type: String, required: true },
    buyer: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
PaymentSchema.index({ order: 1, paymentId: 1, buyer: 1 }, { unique: true });

export const Payment: Model<IPayment> = model("Payment", PaymentSchema);

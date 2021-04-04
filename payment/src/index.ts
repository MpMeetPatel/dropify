import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { RabbitMQWrapper } from "./common";
import {
  receiveDropInPaymentCreated,
  receiveDropInPaymentDeleted,
  receiveDropInPaymentUpdated,
  receiveOrderPaymentCreated,
  receivePaymentUserCreated,
  receivePaymentUserUpdated,
} from "./messages/consumers";
import { bindQueues, prepareQueues } from "./messages/queues";
import { dropInRoutes } from "./routes/dropIn";
import { orderRoutes } from "./routes/order";
import { paymentRoutes } from "./routes/payment";
import { userRoutes } from "./routes/user";
import { IUser } from "./models/User";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, '/.env') });

const app = express();
const PORT = 3000;

declare global {
  namespace Express {
    interface Request {
      user: IUser //or other type you would like to use
    }
  }
}

app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

(async function () {
  try {
    await RabbitMQWrapper.connect();
    await prepareQueues();
    await bindQueues();

    // Listeners
    await receivePaymentUserCreated();
    await receivePaymentUserUpdated();
    await receiveDropInPaymentCreated();
    await receiveDropInPaymentUpdated();
    await receiveDropInPaymentDeleted();
    await receiveOrderPaymentCreated();
  } catch (err) {
    console.log("rabbitmq err", err);
  }

  try {
    await mongoose.connect(`mongodb://payment-mongo:27017/payment`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to payment mongodb");
  } catch (err) {
    console.error(err);
  }

  app.use("/api/payment/", paymentRoutes);
  app.use("/api/payment/user", userRoutes);
  app.use("/api/payment/dropin", dropInRoutes);
  app.use("/api/payment/order", orderRoutes);

  app.listen(PORT, () => {
    console.log(`Payment service listening on port: ${PORT}`);
  });
})();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { RabbitMQWrapper } from "./common";
import {
  receiveDropInOrderCreated,
  receiveDropInOrderDeleted,
  receiveDropInOrderUpdated,
  receiveOrderPaymentUpdated,
  receiveOrderUserCreated,
  receiveOrderUserUpdated,
  receivePaymentUserOnboardingUpdated,
  receivePaymentUserSessionUpdated,
} from "./messages/consumers";
import { bindQueues, prepareQueues } from "./messages/queues";
import { dropInRoutes } from "./routes/dropIn";
import { orderRoutes } from "./routes/order";
import { userRoutes } from "./routes/user";
import { IUser } from "./models/User";

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
    await receiveOrderUserCreated();
    await receiveOrderUserUpdated();
    await receiveDropInOrderCreated();
    await receiveDropInOrderDeleted();
    await receiveDropInOrderUpdated();
    await receiveOrderPaymentUpdated();
    await receivePaymentUserSessionUpdated();
    await receivePaymentUserOnboardingUpdated();
  } catch (err) {
    console.log("rabbitmq err", err);
  }

  try {
    await mongoose.connect(`mongodb://order-mongo:27017/order`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to payment mongodb");
  } catch (err) {
    console.error(err);
  }

  app.use("/api/order", orderRoutes);
  app.use("/api/order/user", userRoutes);
  app.use("/api/order/dropin", dropInRoutes);

  app.listen(PORT, () => {
    console.log(`Order service listening on port: ${PORT}`);
  });
})();

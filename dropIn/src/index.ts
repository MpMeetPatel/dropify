import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { RabbitMQWrapper } from "./common";
import {
  receiveDropInUserCreated,
  receiveDropInUserUpdated,
  receivePaymentUserOnboardingUpdated,
  receivePaymentUserSessionUpdated,
} from "./messages/consumers";
import { bindQueues, prepareQueues } from "./messages/queues";
import { dropInRoutes } from "./routes/dropIn";
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
    await receiveDropInUserCreated();
    await receiveDropInUserUpdated();
    await receivePaymentUserSessionUpdated();
    await receivePaymentUserOnboardingUpdated();
  } catch (err) {
    console.log("rabbitmq err", err);
  }

  try {
    await mongoose.connect(`mongodb://dropin-mongo:27017/dropin`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to dropin mongodb");
  } catch (err) {
    console.error(err);
  }

  app.use("/api/dropin/", dropInRoutes);
  app.use("/api/dropin/user", userRoutes);

  app.listen(PORT, () => {
    console.log(`DropIn service listening on port: ${PORT}`);
  });
})();

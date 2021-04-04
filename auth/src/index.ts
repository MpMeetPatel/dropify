import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { RabbitMQWrapper } from "./common";
import { globalErrorHandler } from "./common/globalError";
import {
  receivePaymentUserOnboardingUpdated,
  receivePaymentUserSessionUpdated,
} from "./messages/consumers";
import { bindQueues, prepareQueues } from "./messages/queues";
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
      user: IUser; //or other type you would like to use
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
    await receivePaymentUserSessionUpdated();
    await receivePaymentUserOnboardingUpdated();
  } catch (err) {
    console.log("rabbitmq err", err);
  }

  try {
    await mongoose.connect(`mongodb://auth-mongo:27017/auth`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to auth mongodb");
  } catch (err) {
    console.error(JSON.stringify(err, null, 2));
  }

  app.use("/api/user", userRoutes);

  // Global error handler
  app.use(globalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Auth service listening on port: ${PORT}`);
  });
})();

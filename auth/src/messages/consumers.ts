import { RabbitMQWrapper } from "../common";
import { User } from "../models/User";
import {
  AUTH_PAYMENT_USER_SESSION_UPDATED,
  AUTH_PAYMENT_USER_ONBOARDING_UPDATED,
} from "./queues";

export async function receivePaymentUserSessionUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    AUTH_PAYMENT_USER_SESSION_UPDATED,
    async (msg) => {
      // @ts-ignore
      const user = JSON.parse(msg.content);

      await User.findByIdAndUpdate(user._id, user);
    },
    { noAck: true }
  );
}

export async function receivePaymentUserOnboardingUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    AUTH_PAYMENT_USER_ONBOARDING_UPDATED,
    async (msg) => {
      // @ts-ignore
      const user = JSON.parse(msg.content);

      await User.findByIdAndUpdate(user._id, user);
    },
    { noAck: true }
  );
}

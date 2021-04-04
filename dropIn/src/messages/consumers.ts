import { RabbitMQWrapper } from "../common";
import { User } from "../models/User";
import {
  DROPIN_PAYMENT_USER_ONBOARDING_UPDATED,
  DROPIN_PAYMENT_USER_SESSION_UPDATED,
  DROPIN_USER_CREATED,
  DROPIN_USER_UPDATED,
} from "./queues";

export async function receiveDropInUserCreated() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_USER_CREATED,
    async (msg) => {
      // @ts-ignore
      await User.create(JSON.parse(msg.content));
    },
    { noAck: true }
  );
}

export async function receiveDropInUserUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_USER_UPDATED,
    async (msg) => {
      // @ts-ignore
      const user = JSON.parse(msg.content);

      await User.findByIdAndUpdate(user._id, user);
    },
    { noAck: true }
  );
}

export async function receivePaymentUserSessionUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_PAYMENT_USER_SESSION_UPDATED,
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
    DROPIN_PAYMENT_USER_ONBOARDING_UPDATED,
    async (msg) => {
      // @ts-ignore
      const user = JSON.parse(msg.content);

      await User.findOneAndUpdate(
        user._id,
        user
      );
    },
    { noAck: true }
  );
}

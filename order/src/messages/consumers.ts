import { RabbitMQWrapper } from "../common";
import { DropIn } from "../models/DropIn";
import { Order } from "../models/Order";
import { User } from "../models/User";
import {
  DROPIN_ORDER_CREATED,
  DROPIN_ORDER_DELETED,
  DROPIN_ORDER_UPDATED,
  ORDER_USER_CREATED,
  ORDER_USER_UPDATED,
  ORDER_PAYMENT_USER_ONBOARDING_UPDATED,
  ORDER_PAYMENT_USER_SESSION_UPDATED,
  ORDER_PAYMENT_UPDATED,
} from "./queues";

export async function receiveOrderUserCreated() {
  await RabbitMQWrapper.connectionChannel.consume(
    ORDER_USER_CREATED,
    async (msg) => {
      // @ts-ignore
      await User.create(JSON.parse(msg.content));
    },
    { noAck: true }
  );
}

export async function receiveOrderUserUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    ORDER_USER_UPDATED,
    async (msg) => {
      // @ts-ignore
      const user = JSON.parse(msg.content);

      await User.findByIdAndUpdate(user._id, user);
    },
    { noAck: true }
  );
}

export async function receiveDropInOrderCreated() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_ORDER_CREATED,
    async (msg) => {
      // @ts-ignore
      await DropIn.create(JSON.parse(msg.content));
    },
    { noAck: true }
  );
}

export async function receiveDropInOrderDeleted() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_ORDER_DELETED,
    async (msg) => {
      // @ts-ignore
      await DropIn.deleteOne({ _id: msg.content.dropInId });
    },
    { noAck: true }
  );
}

export async function receiveDropInOrderUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_ORDER_UPDATED,
    async (msg) => {
      // @ts-ignore
      const dropIn = JSON.parse(msg.content);

      await DropIn.findByIdAndUpdate(dropIn._id, dropIn);
    },
    { noAck: true }
  );
}

export async function receiveOrderPaymentUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    ORDER_PAYMENT_UPDATED,
    async (msg) => {
      // @ts-ignore
      const order = JSON.parse(msg.content);

      await Order.findByIdAndUpdate(order._id, order);
    },
    { noAck: true }
  );
}

export async function receivePaymentUserSessionUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    ORDER_PAYMENT_USER_SESSION_UPDATED,
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
    ORDER_PAYMENT_USER_ONBOARDING_UPDATED,
    async (msg) => {
      // @ts-ignore
      const user = JSON.parse(msg.content);

      await User.findByIdAndUpdate(user._id, user);
    },
    { noAck: true }
  );
}

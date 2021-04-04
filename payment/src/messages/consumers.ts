import { RabbitMQWrapper } from "../common";
import { DropIn } from "../models/DropIn";
import { Order } from "../models/Order";
import { User } from "../models/User";
import {
  DROPIN_PAYMENT_CREATED,
  DROPIN_PAYMENT_DELETED,
  DROPIN_PAYMENT_UPDATED,
  ORDER_PAYMENT_CREATED,
  PAYMENT_USER_CREATED,
  PAYMENT_USER_UPDATED,
} from "./queues";

export async function receivePaymentUserCreated() {
  await RabbitMQWrapper.connectionChannel.consume(
    PAYMENT_USER_CREATED,
    async (msg) => {
      // @ts-ignore
      await User.create(JSON.parse(msg.content));
    },
    { noAck: true }
  );
}

export async function receivePaymentUserUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    PAYMENT_USER_UPDATED,
    async (msg) => {
      // @ts-ignore
      const user = JSON.parse(msg.content);

      await User.findByIdAndUpdate(user._id, user);
    },
    { noAck: true }
  );
}

export async function receiveDropInPaymentCreated() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_PAYMENT_CREATED,
    async (msg) => {
      // @ts-ignore
      await DropIn.create(JSON.parse(msg.content));
    },
    { noAck: true }
  );
}

export async function receiveDropInPaymentUpdated() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_PAYMENT_UPDATED,
    async (msg) => {
      // @ts-ignore
      const dropIn = JSON.parse(msg.content);

      await DropIn.findByIdAndUpdate(dropIn._id, dropIn);
    },
    { noAck: true }
  );
}

export async function receiveDropInPaymentDeleted() {
  await RabbitMQWrapper.connectionChannel.consume(
    DROPIN_PAYMENT_DELETED,
    async (msg) => {
      // @ts-ignore
      await DropIn.deleteOne({ _id: msg.content.dropInId });
    },
    { noAck: true }
  );
}

export async function receiveOrderPaymentCreated() {
  await RabbitMQWrapper.connectionChannel.consume(
    ORDER_PAYMENT_CREATED,
    async (msg) => {
      // @ts-ignore
      await Order.create(JSON.parse(msg.content));
    },
    { noAck: true }
  );
}

import { RabbitMQWrapper } from "../common";
import { IOrder } from "../models/Order";

export async function sendOrderCreated(orderData: IOrder) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "order.created",
    Buffer.from(JSON.stringify(orderData))
  );
}

export async function sendOrderDeleted(orderData: IOrder) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "order.deleted",
    Buffer.from(JSON.stringify(orderData))
  );
}
export async function sendOrderUpdated(orderData: IOrder) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "order.updated",
    Buffer.from(JSON.stringify(orderData))
  );
}
import { RabbitMQWrapper } from "../common";
import { IUser } from "../models/User";
import { IOrder } from "../models/Order";

export async function sendUserUpdated(userData: IUser) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "user.updated",
    Buffer.from(JSON.stringify(userData))
  );
}

export async function sendOrderUpdated(orderData: IOrder) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "order.updated",
    Buffer.from(JSON.stringify(orderData))
  );
}

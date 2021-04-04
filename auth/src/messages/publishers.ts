import { RabbitMQWrapper } from "../common";
import { IUser } from "../models/User";

export async function sendUserCreated(userData: IUser) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "user.created",
    Buffer.from(JSON.stringify(userData))
  );
}

export async function sendUserUpdated(userData: IUser) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "user.updated",
    Buffer.from(JSON.stringify(userData))
  );
}

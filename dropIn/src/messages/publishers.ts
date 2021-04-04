import { RabbitMQWrapper } from "../common";
import { IDropIn } from "../models/DropIn";

export async function sendDropInCreated(dropInData: IDropIn) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "dropIn.created",
    Buffer.from(JSON.stringify(dropInData))
  );
}

export async function sendDropInUpdated(dropInData: IDropIn) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "dropIn.updated",
    Buffer.from(JSON.stringify(dropInData))
  );
}

export async function sendDropInDeleted(dropInId: string) {
  RabbitMQWrapper.connectionChannel.publish(
    "dropify",
    "dropIn.deleted",
    Buffer.from(JSON.stringify(dropInId))
  );
}

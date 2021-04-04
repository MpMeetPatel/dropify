import rabbitmq, { Channel } from 'amqplib';

class RabbitMQWrapperClass {
  private _connectionChannel?: Channel;

  get connectionChannel() {
    if (!this._connectionChannel) {
      throw new Error('Cannot access rabbitmq before connecting');
    }

    return this._connectionChannel;
  }

  connect() {
    return new Promise(async (resolve, reject) => {
      try {
        const open = await rabbitmq.connect("amqp://rabbitmq-serv:8080");
        this._connectionChannel = await open.createChannel();
        resolve(this.connectionChannel);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const RabbitMQWrapper = new RabbitMQWrapperClass();

import { RabbitMQWrapper } from "../common";

// ----------------- USER ------------------ //
// ----------------------------------------- //
// User Created
export const AUTH_USER_CREATED = "AUTH_USER_CREATED";
export const DROPIN_USER_CREATED = "DROPIN_USER_CREATED";
export const ORDER_USER_CREATED = "ORDER_USER_CREATED";
export const PAYMENT_USER_CREATED = "PAYMENT_USER_CREATED";
// User Updated
export const AUTH_USER_UPDATED = "AUTH_USER_UPDATED";
export const DROPIN_USER_UPDATED = "DROPIN_USER_UPDATED";
export const ORDER_USER_UPDATED = "ORDER_USER_UPDATED";
export const PAYMENT_USER_UPDATED = "PAYMENT_USER_UPDATED";
export const AUTH_PAYMENT_USER_SESSION_UPDATED = "AUTH_PAYMENT_USER_SESSION_UPDATED";
export const AUTH_PAYMENT_USER_ONBOARDING_UPDATED =
  "AUTH_PAYMENT_USER_ONBOARDING_UPDATED";

// ----------------- DROPIN ---------------- //
// ----------------------------------------- //
// DropIn Created
export const DROPIN_ORDER_CREATED = "DROPIN_ORDER_CREATED";
export const DROPIN_PAYMENT_CREATED = "DROPIN_PAYMENT_CREATED";

// DropIn/User Updated
export const DROPIN_ORDER_UPDATED = "DROPIN_ORDER_UPDATED";
export const DROPIN_PAYMENT_UPDATED = "DROPIN_PAYMENT_UPDATED";
export const DROPIN_PAYMENT_USER_SESSION_UPDATED = "DROPIN_PAYMENT_USER_SESSION_UPDATED";
export const DROPIN_PAYMENT_USER_ONBOARDING_UPDATED =
  "DROPIN_PAYMENT_USER_ONBOARDING_UPDATED";
// DropIn Deleted
export const DROPIN_ORDER_DELETED = "DROPIN_ORDER_DELTED";
export const DROPIN_PAYMENT_DELETED = "DROPIN_PAYMENT_DELETED";

// ----------------- ORDER ------------------ //
// ----------------------------------------- //
// Order Created
export const ORDER_PAYMENT_CREATED = "ORDER_PAYMENT_CREATED";

// Order/User Updated
export const ORDER_PAYMENT_UPDATED = "ORDER_PAYMENT_UPDATED";
export const ORDER_PAYMENT_USER_SESSION_UPDATED = "ORDER_PAYMENT_USER_SESSION_UPDATED";
export const ORDER_PAYMENT_USER_ONBOARDING_UPDATED =
  "ORDER_PAYMENT_USER_ONBOARDING_UPDATED";

// ----------------- PAYMENT --------------- //
// ----------------------------------------- //
// Payment_user updated(Strip onboarding + checkout)
export const PAYMENT_USER_SESSION_UPDATED = "PAYMENT_USER_SESSION_UPDATED";
export const PAYMENT_USER_ONBOARDING_UPDATED =
  "PAYMENT_USER_ONBOARDING_UPDATED";

// Payment_order updated(status update)
export const PAYMENT_ORDER_UPDATED = "PAYMENT_ORDER_UPDATED";

export const prepareQueues = async () => {
  // ----------------- USER ------------------ //
  // ----------------------------------------- //
  // User Created
  await RabbitMQWrapper.connectionChannel.assertQueue(AUTH_USER_CREATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_USER_CREATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(ORDER_USER_CREATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(PAYMENT_USER_CREATED, {
    durable: true,
  });

  // User Updated
  await RabbitMQWrapper.connectionChannel.assertQueue(AUTH_USER_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_USER_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(ORDER_USER_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(PAYMENT_USER_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(AUTH_PAYMENT_USER_SESSION_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(AUTH_PAYMENT_USER_ONBOARDING_UPDATED, {
    durable: true,
  });

  // ----------------- DROPIN ---------------- //
  // ----------------------------------------- //
  // DropIn Created
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_ORDER_CREATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_PAYMENT_CREATED, {
    durable: true,
  });

  // DropIn/User Updated
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_ORDER_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_PAYMENT_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_PAYMENT_USER_SESSION_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_PAYMENT_USER_ONBOARDING_UPDATED, {
    durable: true,
  });

  // DropIn Deleted
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_ORDER_DELETED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(DROPIN_PAYMENT_DELETED, {
    durable: true,
  });

  // ----------------- ORDER ------------------ //
  // ----------------------------------------- //
  // Order Created
  await RabbitMQWrapper.connectionChannel.assertQueue(ORDER_PAYMENT_CREATED, {
    durable: true,
  });

  // Order/User Updated
  await RabbitMQWrapper.connectionChannel.assertQueue(ORDER_PAYMENT_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(ORDER_PAYMENT_USER_SESSION_UPDATED, {
    durable: true,
  });
  await RabbitMQWrapper.connectionChannel.assertQueue(ORDER_PAYMENT_USER_ONBOARDING_UPDATED, {
    durable: true,
  });

  // ----------------- PAYMENT --------------- //
  // ----------------------------------------- //
  // Payment_user updated(Strip onboarding + checkout)
  await RabbitMQWrapper.connectionChannel.assertQueue(
    PAYMENT_USER_SESSION_UPDATED,
    {
      durable: true,
    }
  );
  await RabbitMQWrapper.connectionChannel.assertQueue(
    PAYMENT_USER_ONBOARDING_UPDATED,
    {
      durable: true,
    }
  );

  // Payment_order updated(status update)
  await RabbitMQWrapper.connectionChannel.assertQueue(PAYMENT_ORDER_UPDATED, {
    durable: true,
  });
};

export const bindQueues = async () => {
  await RabbitMQWrapper.connectionChannel.assertExchange("dropify", "direct", {
    durable: true,
  });
  // ----------------- USER ------------------ //
  // ----------------------------------------- //
  // User Created
  await RabbitMQWrapper.connectionChannel.bindQueue(
    AUTH_USER_CREATED,
    "dropify",
    "user.created"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_USER_CREATED,
    "dropify",
    "user.created"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    ORDER_USER_CREATED,
    "dropify",
    "user.created"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    PAYMENT_USER_CREATED,
    "dropify",
    "user.created"
  );

  // User Updated
  await RabbitMQWrapper.connectionChannel.bindQueue(
    AUTH_USER_UPDATED,
    "dropify",
    "user.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_USER_UPDATED,
    "dropify",
    "user.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    ORDER_USER_UPDATED,
    "dropify",
    "user.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    PAYMENT_USER_UPDATED,
    "dropify",
    "user.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    AUTH_PAYMENT_USER_SESSION_UPDATED,
    "dropify",
    "user.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    AUTH_PAYMENT_USER_ONBOARDING_UPDATED,
    "dropify",
    "user.updated"
  );

  // ----------------- DROPIN ---------------- //
  // ----------------------------------------- //
  // DropIn Updated
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_ORDER_CREATED,
    "dropify",
    "dropIn.created"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_PAYMENT_CREATED,
    "dropify",
    "dropIn.created"
  );

  // DropIn Updated
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_ORDER_UPDATED,
    "dropify",
    "dropIn.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_PAYMENT_UPDATED,
    "dropify",
    "dropIn.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_PAYMENT_USER_SESSION_UPDATED,
    "dropify",
    "dropIn.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_PAYMENT_USER_ONBOARDING_UPDATED,
    "dropify",
    "dropIn.updated"
  );

  // DropIn Deleted
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_ORDER_DELETED,
    "dropify",
    "dropIn.deleted"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    DROPIN_PAYMENT_DELETED,
    "dropify",
    "dropIn.deleted"
  );

  // ----------------- ORDER ----------------- //
  // ----------------------------------------- //
  // Order Created
  await RabbitMQWrapper.connectionChannel.bindQueue(
    ORDER_PAYMENT_CREATED,
    "dropify",
    "order.created"
  );
  // Order Updated
  await RabbitMQWrapper.connectionChannel.bindQueue(
    ORDER_PAYMENT_UPDATED,
    "dropify",
    "order.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    ORDER_PAYMENT_USER_SESSION_UPDATED,
    "dropify",
    "order.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    ORDER_PAYMENT_USER_ONBOARDING_UPDATED,
    "dropify",
    "order.updated"
  );

  // ----------------- PAYMENT --------------- //
  // ----------------------------------------- //
  // Payment_user updated(Strip onboarding + checkout)
  await RabbitMQWrapper.connectionChannel.bindQueue(
    PAYMENT_USER_SESSION_UPDATED,
    "dropify",
    "user.updated"
  );
  await RabbitMQWrapper.connectionChannel.bindQueue(
    PAYMENT_USER_ONBOARDING_UPDATED,
    "dropify",
    "user.updated"
  );

  // Payment_order updated(status update)
  await RabbitMQWrapper.connectionChannel.bindQueue(
    PAYMENT_ORDER_UPDATED,
    "dropify",
    "order.updated"
  );
};

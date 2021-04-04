import express from "express";
import {
  createConnectAccount,
  paymentInsert,
  getBySingedInUserId,
  stripeSessionSuccess,
  stripeSession,
  getAllPayments,
  stripeSignedInUserAccountStatus,
  getBySingedInUserBalance,
} from "../controllers/payment";
import { authenticateUser } from "../common/authenticateUser";
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: `Too many requests from this IP so some API routes won't work, please try again after 10 min`,
});

const router = express.Router();

router.post(
  "/create-connected-account",
  apiLimiter,
  authenticateUser,
  createConnectAccount
);
router.post("/insert", authenticateUser, paymentInsert);
router.get("/", authenticateUser, getBySingedInUserId);
router.get("/getAll", authenticateUser, getAllPayments);
router.post(
  "/create-stripe-session",
  apiLimiter,
  authenticateUser,
  stripeSession
);
router.get(
  "/account-status",
  authenticateUser,
  stripeSignedInUserAccountStatus
);
router.post("/stripe-success", authenticateUser, stripeSessionSuccess);
router.get("/balance", authenticateUser, getBySingedInUserBalance);

export { router as paymentRoutes };

import express from "express";
import {
  getAllOrders,
} from "../controllers/order";
import { authenticateUser } from "../common/authenticateUser";

const router = express.Router();

router.get(
  "/getAll",
  authenticateUser,
  getAllOrders
);

export { router as orderRoutes };

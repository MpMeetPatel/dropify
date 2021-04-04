import express from "express";
import {
  orderInsert,
  getBySingnedInUserAndDelete,
  getBySingedInUserId,
  getAllOrders,

  getSingedInUserOrderById,
  getSingedInUserOrderByDropInId
} from "../controllers/order";
import { authenticateUser } from "../common/authenticateUser";

const router = express.Router();

router.post("/insert", authenticateUser, orderInsert);

router.get(
  "/getAll",
  getAllOrders
);

router.get("/", authenticateUser, getBySingedInUserId);
router.get("/:id", authenticateUser, getSingedInUserOrderById);
router.get("/dropin/:dropInId", authenticateUser, getSingedInUserOrderByDropInId);

// Not going to use right now
router.delete(
  "/delete/:orderId",
  authenticateUser,
  getBySingnedInUserAndDelete
);

export { router as orderRoutes };

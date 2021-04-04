import express from "express";
import {
  dropInInsert,
  getBySingnedInUserAndDelete,
  getBySingedInUserId,
  getAllDropIns,
  getSingedInUserDropIn,
  getByNameSearch,
  updateDropInById,
} from "../controllers/dropIn";
import { authenticateUser } from "../common/authenticateUser";
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: `Too many update requests from this IP so some API routes won't work, please try again after 10 min`,
});

const router = express.Router();

router.post("/insert", authenticateUser, dropInInsert);

router.get(
  "/getAll",
  authenticateUser,
  getAllDropIns
);

router.get("/", authenticateUser, getBySingedInUserId);
router.get("/:id", authenticateUser, getSingedInUserDropIn);

router.post("/update/:dropInId", apiLimiter, authenticateUser, updateDropInById);

router.post("/search", authenticateUser, getByNameSearch);

router.delete(
  "/delete/:dropInId",
  authenticateUser,
  getBySingnedInUserAndDelete
);

export { router as dropInRoutes };

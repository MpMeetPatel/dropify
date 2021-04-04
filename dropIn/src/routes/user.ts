import express from "express";
import {
  getAllUsers,
  allowPermissionTo,
} from "../controllers/user";
import { authenticateUser } from "../common/authenticateUser";

const router = express.Router();

router.get(
  "/getAll",
  authenticateUser,
  getAllUsers
);

export { router as userRoutes };

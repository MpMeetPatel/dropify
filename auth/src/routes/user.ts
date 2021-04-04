import express from "express";
import {
  signUpUser,
  deleteUser,
  getAllUsers,
  allowPermissionTo,
  signInUser,
  forgotPassword,
  resetPassword,
  updateSingedInUser,
  signOutUser,
  getSignedInUser,
} from "../controllers/user";
import { authenticateUser } from "../common/authenticateUser";
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: `Too many requests from this IP so some API routes won't work, please try again after 10 min`,
});

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/signin", signInUser);
router.get("/signout", authenticateUser, signOutUser);
router.get("/", authenticateUser, getSignedInUser);
router.post("/update", apiLimiter, authenticateUser, updateSingedInUser);
router.post("/forgot-password", apiLimiter, forgotPassword);
router.post("/reset-password/:resetToken", apiLimiter, resetPassword);
router.get("/getAll", authenticateUser, getAllUsers);
router.delete(
  "/delete/:userId",
  authenticateUser,
  allowPermissionTo("admin"),
  deleteUser
);

export { router as userRoutes };

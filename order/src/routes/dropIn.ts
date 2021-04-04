import express from "express";
import {
  getAllDropIns,
} from "../controllers/dropIn";
import { authenticateUser } from "../common/authenticateUser";

const router = express.Router();

router.get(
  "/getAll",
  authenticateUser,
  getAllDropIns
);

export { router as dropInRoutes };

import express from "express";
import {
  getAttendanceController,
  getReportsController,
  getUsersOverview,
} from "../controllers/adminController.js";
import { auth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/users", auth("admin"), asyncHandler(getUsersOverview));
router.get("/attendance", auth(), asyncHandler(getAttendanceController));
router.get("/reports", auth("admin"), asyncHandler(getReportsController));

export default router;

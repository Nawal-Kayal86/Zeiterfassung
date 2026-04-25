import express from "express";
import { auth } from "../middleware/auth.js";
import { getAttendanceController } from "../controllers/adminController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/", auth(), asyncHandler(getAttendanceController));

export default router;

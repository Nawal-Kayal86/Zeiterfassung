import express from "express";
import { auth } from "../middleware/auth.js";
import { getSchedule, saveScheduleController } from "../controllers/scheduleController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/:userId", auth(), asyncHandler(getSchedule));
router.post("/", auth("admin"), asyncHandler(saveScheduleController));

export default router;

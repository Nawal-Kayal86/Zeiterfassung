import express from "express";
import { auth } from "../middleware/auth.js";
import { getCalendarController, saveCalendarController } from "../controllers/calendarController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/", auth(), asyncHandler(getCalendarController));
router.post("/", auth("admin"), asyncHandler(saveCalendarController));

export default router;

import express from "express";
import { auth } from "../middleware/auth.js";
import {
  deleteWorkSessionController,
  getWorkSessionSummaryController,
  listWorkSessions,
  saveManualWorkSessionController,
  startWorkSessionController,
  stopWorkSessionController,
  updateWorkSessionController,
} from "../controllers/workSessionController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.post("/start", auth(), asyncHandler(startWorkSessionController));
router.post("/stop", auth(), asyncHandler(stopWorkSessionController));
router.post("/manual-time", auth(), asyncHandler(saveManualWorkSessionController));
router.get("/", auth(), asyncHandler(listWorkSessions));
router.get("/summary", auth(), asyncHandler(getWorkSessionSummaryController));
router.delete("/:id", auth(), asyncHandler(deleteWorkSessionController));
router.put("/:id", auth(), asyncHandler(updateWorkSessionController));

export default router;

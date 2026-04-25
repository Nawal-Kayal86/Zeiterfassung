import express from "express";
import { auth } from "../middleware/auth.js";
import {
  approveLeaveRequestController,
  createLeaveRequestController,
  deleteLeaveRequestController,
  getLeaveCalendarController,
  listAdminLeaveRequests,
  listOwnLeaveRequests,
  rejectLeaveRequestController,
} from "../controllers/leaveRequestController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.post("/", auth(), asyncHandler(createLeaveRequestController));
router.get("/", auth(), asyncHandler(listOwnLeaveRequests));
router.get("/calendar", auth(), asyncHandler(getLeaveCalendarController));
router.get("/admin", auth(), asyncHandler(listAdminLeaveRequests));
router.put("/:id/approve", auth(), asyncHandler(approveLeaveRequestController));
router.put("/:id/reject", auth(), asyncHandler(rejectLeaveRequestController));
router.delete("/:id", auth(), asyncHandler(deleteLeaveRequestController));

export default router;

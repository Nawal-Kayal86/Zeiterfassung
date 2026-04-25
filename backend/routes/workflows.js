import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createWorkflowController,
  deleteWorkflowController,
  listWorkflows,
  markWorkflowDoneController,
} from "../controllers/workflowController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/", auth(), asyncHandler(listWorkflows));
router.post("/", auth(), asyncHandler(createWorkflowController));
router.put("/:id/done", auth(), asyncHandler(markWorkflowDoneController));
router.delete("/:id", auth(), asyncHandler(deleteWorkflowController));

export default router;

import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createDepartmentController,
  deleteDepartmentController,
  listDepartments,
  updateDepartmentController,
} from "../controllers/departmentController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/", auth(), asyncHandler(listDepartments));
router.post("/", auth("admin"), asyncHandler(createDepartmentController));
router.put("/:id", auth("admin"), asyncHandler(updateDepartmentController));
router.delete("/:id", auth("admin"), asyncHandler(deleteDepartmentController));

export default router;

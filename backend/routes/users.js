import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createUserController,
  deleteUserController,
  getUser,
  listUserNames,
  listUsers,
  updateProfile,
  updateUserController,
} from "../controllers/userController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/names", auth("admin"), asyncHandler(listUserNames));
router.get("/", auth("admin"), asyncHandler(listUsers));
router.put("/profile/update", auth(), asyncHandler(updateProfile));
router.get("/:id", auth("admin"), asyncHandler(getUser));
router.post("/", auth("admin"), asyncHandler(createUserController));
router.put("/:id", auth("admin"), asyncHandler(updateUserController));
router.delete("/:id", auth("admin"), asyncHandler(deleteUserController));

export default router;

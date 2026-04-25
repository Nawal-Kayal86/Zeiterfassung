import express from "express";
import { auth } from "../middleware/auth.js";
import { getReportsController } from "../controllers/adminController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/", auth("admin"), asyncHandler(getReportsController));

export default router;

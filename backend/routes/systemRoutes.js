import express from "express";
import { debugCheck } from "../controllers/systemController.js";
import { auth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/debug-check", auth("admin"), asyncHandler(debugCheck));

export default router;

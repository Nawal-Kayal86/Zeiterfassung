import express from "express";
import { auth } from "../middleware/auth.js";
import { listLogs } from "../controllers/logController.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get("/", auth(), asyncHandler(listLogs));

export default router;

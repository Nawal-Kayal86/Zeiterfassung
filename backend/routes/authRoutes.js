import express from "express";
import { login, me } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";
import { loginRateLimit } from "../middleware/security.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.post("/login", loginRateLimit, asyncHandler(login));
router.get("/me", auth(), asyncHandler(me));

export default router;

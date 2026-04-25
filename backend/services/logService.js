import mongoose from "mongoose";
import Log from "../models/Log.js";
import { checkDailyLogs } from "./validationService.js";

let lastValidationAt = 0;
let validationPromise = null;

async function ensureRecentValidation() {
  const now = Date.now();
  if (validationPromise) return validationPromise;
  if (now - lastValidationAt < 15 * 60 * 1000) return null;

  validationPromise = checkDailyLogs()
    .catch((error) => {
      console.error("Validation error:", error);
    })
    .finally(() => {
      lastValidationAt = Date.now();
      validationPromise = null;
    });

  return validationPromise;
}

export async function getLogs(user) {
  await ensureRecentValidation();

  const query = user.role === "admin" ? {} : { user_id: user.id };
  return Log.find(query)
    .populate("user_id", "name")
    .sort({ created_at: -1 })
    .limit(100)
    .lean();
}

export async function createLogEntry({
  message,
  level = "INFO",
  userId = null,
  violationDate = null,
}) {
  if (!message) {
    return null;
  }

  try {
    return await Log.create({
      message,
      level,
      user_id: mongoose.Types.ObjectId.isValid(userId) ? userId : null,
      violation_date: violationDate,
    });
  } catch {
    return null;
  }
}

import WorkSchedule from "../models/WorkSchedule.js";
import { ensureObjectId } from "../utils/request.js";
import { createHttpError } from "../utils/http.js";

function defaultSchedule(userId) {
  return {
    user_id: userId,
    weekly_hours: 40,
    schedule: {
      mon: { from: "08:00", to: "16:00", active: true },
      tue: { from: "08:00", to: "16:00", active: true },
      wed: { from: "08:00", to: "16:00", active: true },
      thu: { from: "08:00", to: "16:00", active: true },
      fri: { from: "08:00", to: "16:00", active: true },
      sat: { from: "08:00", to: "16:00", active: false },
      sun: { from: "08:00", to: "16:00", active: false },
    },
    is_default: true,
  };
}

export async function getScheduleForUser(requestingUser, userId) {
  ensureObjectId(userId, "Ungueltige Benutzer-ID");

  if (requestingUser.role !== "admin" && requestingUser.id !== userId) {
    throw createHttpError(403, "Keine Berechtigung");
  }

  const schedule = await WorkSchedule.findOne({ user_id: userId }).lean();
  return schedule || defaultSchedule(userId);
}

export async function saveSchedule(body) {
  ensureObjectId(body.user_id, "Benutzer-ID fehlt oder ist ungueltig");
  const weeklyHours = Number(body.weekly_hours);

  if (!Number.isFinite(weeklyHours) || weeklyHours <= 0) {
    throw createHttpError(400, "weekly_hours muss groesser als 0 sein");
  }

  const schedule = await WorkSchedule.findOneAndUpdate(
    { user_id: body.user_id },
    {
      weekly_hours: weeklyHours,
      schedule: body.schedule,
      updated_at: Date.now(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  ).lean();

  return {
    message: "Dienstplan erfolgreich gespeichert",
    schedule,
  };
}

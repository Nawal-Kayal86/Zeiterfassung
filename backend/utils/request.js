import mongoose from "mongoose";

const OBJECT_ID_ERROR = "Ungueltige ID";
const DATE_ERROR = "Ungueltiges Datum";
const TIME_ERROR = "Ungueltige Uhrzeit";

export function isValidObjectId(value) {
  return typeof value === "string" && mongoose.isValidObjectId(value);
}

export function ensureObjectId(value, message = OBJECT_ID_ERROR) {
  if (!isValidObjectId(value)) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }

  return value;
}

export function normalizeTrimmedString(value, { maxLength = 255 } = {}) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.slice(0, maxLength);
}

export function parseIsoDate(value, message = DATE_ERROR) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }

  return date;
}

export function parseDateTimeParts(dateValue, timeValue) {
  if (!timeValue) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const error = new Error(DATE_ERROR);
    error.status = 400;
    throw error;
  }

  if (!/^\d{2}:\d{2}$/.test(timeValue)) {
    const error = new Error(TIME_ERROR);
    error.status = 400;
    throw error;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  const result = new Date(year, month - 1, day, hours, minutes);

  if (Number.isNaN(result.getTime())) {
    const error = new Error(`${DATE_ERROR} oder ${TIME_ERROR}`);
    error.status = 400;
    throw error;
  }

  return result;
}

export function sanitizePause(value) {
  if (value === undefined || value === null || value === "") {
    return "0:00";
  }

  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value)) {
    const error = new Error("Pause muss im Format H:MM oder HH:MM sein");
    error.status = 400;
    throw error;
  }

  return value;
}

export function getBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") return null;

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
}

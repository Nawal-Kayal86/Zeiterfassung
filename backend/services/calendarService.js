import { Holiday } from "../models/Holiday.js";
import { createHttpError } from "../utils/http.js";

function parseYear(value) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw createHttpError(400, "Ungueltiges Jahr");
  }
  return year;
}

function parseState(value) {
  return typeof value === "string" ? value.trim() || "W" : "W";
}

export async function getCalendar(query) {
  const year = parseYear(query.year);
  const state = parseState(query.state);
  const data = await Holiday.findOne({ year, state }).lean();

  if (!data) {
    return { year, state, holidays: [], ferien: [] };
  }

  return data;
}

export async function saveCalendar(body) {
  const year = parseYear(body.year);
  const state = parseState(body.state);
  const holidays = Array.isArray(body.holidays) ? body.holidays : [];
  const ferien = Array.isArray(body.ferien) ? body.ferien : [];

  return Holiday.findOneAndUpdate(
    { year, state },
    { holidays, ferien, updatedAt: new Date() },
    { upsert: true, new: true, runValidators: true },
  ).lean();
}

import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { ensureObjectId, normalizeTrimmedString } from "../utils/request.js";
import { createHttpError } from "../utils/http.js";

const FULL_YEAR_VACATION_DAYS = 25;

function calculateVacationDaysForCurrentYear(startDateValue, endDateValue = null) {
  if (!startDateValue) return FULL_YEAR_VACATION_DAYS;

  const today = new Date();
  const year = today.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  const employmentStart = new Date(startDateValue);
  const employmentEnd = endDateValue ? new Date(endDateValue) : yearEnd;

  if (Number.isNaN(employmentStart.getTime())) return FULL_YEAR_VACATION_DAYS;
  if (Number.isNaN(employmentEnd.getTime())) return FULL_YEAR_VACATION_DAYS;

  const activeStart = employmentStart > yearStart ? employmentStart : yearStart;
  const activeEnd = employmentEnd < yearEnd ? employmentEnd : yearEnd;

  if (activeEnd < activeStart) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const activeDays = Math.floor((activeEnd - activeStart) / msPerDay) + 1;
  const totalDaysInYear = Math.floor((yearEnd - yearStart) / msPerDay) + 1;
  const calculatedDays = (activeDays / totalDaysInYear) * FULL_YEAR_VACATION_DAYS;

  return Math.round(calculatedDays * 100) / 100;
}

function normalizeUserPayload(body) {
  const parsedWeeklyHours = Number(body.weekly_hours);
  const parsedVacationDays = Number(body.vacation_days_per_year);

  return {
    name: normalizeTrimmedString(body.name, { maxLength: 100 }),
    email: normalizeTrimmedString(body.email, { maxLength: 255 })?.toLowerCase() || null,
    role: ["user", "admin", "employee", "department_leader"].includes(body.role) ? body.role : "user",
    department: normalizeTrimmedString(body.department, { maxLength: 100 }),
    nfc_tag: normalizeTrimmedString(body.nfc_tag, { maxLength: 100 }),
    password: typeof body.password === "string" ? body.password : null,
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    is_active: body.is_active !== false,
    vacation_days_per_year: Number.isFinite(parsedVacationDays) && parsedVacationDays >= 0 ? parsedVacationDays : undefined,
    weekly_hours: Number.isFinite(parsedWeeklyHours) && parsedWeeklyHours > 0 ? parsedWeeklyHours : 40,
    work_schedule: body.work_schedule || undefined,
  };
}

async function ensureUniqueUserFields({ email, nfc_tag, userId = null }) {
  const conditions = [];
  if (email) conditions.push({ email });
  if (nfc_tag) conditions.push({ nfc_tag });
  if (conditions.length === 0) return null;

  return User.findOne({
    $or: conditions,
    ...(userId ? { _id: { $ne: userId } } : {}),
  }).lean();
}

export async function getUserNames() {
  const users = await User.find({}, "name department").sort({ name: 1 }).lean();
  return users.map((user) => ({ id: user._id, name: user.name, department: user.department }));
}

export async function getUsers() {
  const users = await User.find(
    {},
    "name email role department nfc_tag start_date end_date is_active vacation_days_per_year weekly_hours work_schedule created_at",
  )
    .sort({ created_at: -1 })
    .lean();

  return users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    nfc_tag: user.nfc_tag,
    start_date: user.start_date,
    end_date: user.end_date,
    is_active: user.is_active !== false,
    vacation_days_per_year: user.vacation_days_per_year || 25,
    weekly_hours: user.weekly_hours || 40,
    work_schedule: user.work_schedule || null,
    created_at: user.created_at,
  }));
}

export async function updateOwnProfile(userId, body) {
  const name = normalizeTrimmedString(body.name, { maxLength: 100 });
  const email = normalizeTrimmedString(body.email, { maxLength: 255 })?.toLowerCase() || null;
  const password = typeof body.password === "string" ? body.password : null;
  const user = await User.findById(userId);
  let changedName = false;
  let changedEmail = false;
  let changedPassword = false;

  if (!user) {
    throw createHttpError(404, "Benutzer nicht gefunden");
  }

  if (name && name !== user.name) {
    user.name = name;
    changedName = true;
  }

  if (email) {
    const emailExists = await User.findOne({ email, _id: { $ne: userId } }).lean();
    if (emailExists) {
      throw createHttpError(409, "E-Mail bereits vergeben");
    }
    if (email !== user.email) {
      user.email = email;
      changedEmail = true;
    }
  }

  if (password) {
    if (password.length < 8) {
      throw createHttpError(400, "Passwort muss mindestens 8 Zeichen haben");
    }
    user.password_hash = await bcrypt.hash(password, 10);
    changedPassword = true;
  }

  await user.save();
  return {
    message: "Profil erfolgreich aktualisiert",
    changedName,
    changedEmail,
    changedPassword,
    userName: user.name,
  };
}

export async function getUserById(id) {
  ensureObjectId(id);
  const user = await User.findById(
    id,
    "name email role department nfc_tag start_date end_date is_active vacation_days_per_year weekly_hours work_schedule created_at",
  ).lean();

  if (!user) {
    throw createHttpError(404, "Benutzer nicht gefunden");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    nfc_tag: user.nfc_tag,
    start_date: user.start_date,
    end_date: user.end_date,
    is_active: user.is_active !== false,
    vacation_days_per_year: user.vacation_days_per_year || 25,
    weekly_hours: user.weekly_hours || 40,
    work_schedule: user.work_schedule || null,
    created_at: user.created_at,
  };
}

export async function createUser(body) {
  const payload = normalizeUserPayload(body);
  if (!payload.name || !payload.email || !payload.password || payload.password.length < 8) {
    throw createHttpError(400, "Name, Email und Passwort mit mindestens 8 Zeichen erforderlich");
  }

  const exists = await ensureUniqueUserFields(payload);
  if (exists) {
    throw createHttpError(409, "E-Mail oder NFC-Tag bereits vergeben");
  }

  const password_hash = await bcrypt.hash(payload.password, 10);
  const vacationDays = calculateVacationDaysForCurrentYear(payload.start_date, payload.end_date);
  const newUser = await User.create({
    name: payload.name,
    email: payload.email,
    role: payload.role,
    department: payload.department,
    nfc_tag: payload.nfc_tag,
    start_date: payload.start_date,
    end_date: payload.end_date,
    is_active: payload.is_active,
    vacation_days_per_year: vacationDays,
    weekly_hours: payload.weekly_hours,
    work_schedule: payload.work_schedule,
    password_hash,
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
    nfc_tag: newUser.nfc_tag,
    start_date: newUser.start_date,
    end_date: newUser.end_date,
    vacation_days_per_year: newUser.vacation_days_per_year,
  };
}

export async function updateUser(id, body) {
  ensureObjectId(id);
  const payload = normalizeUserPayload(body);
  const user = await User.findById(id);

  if (!user) {
    throw createHttpError(404, "Benutzer nicht gefunden");
  }

  const duplicate = await ensureUniqueUserFields({
    email: payload.email,
    nfc_tag: payload.nfc_tag,
    userId: id,
  });

  if (duplicate) {
    throw createHttpError(409, "E-Mail oder NFC-Tag bereits vergeben");
  }

  if (payload.name) user.name = payload.name;
  if (payload.email) user.email = payload.email;
  user.role = payload.role || user.role;
  user.department = payload.department ?? user.department;
  user.nfc_tag = payload.nfc_tag ?? user.nfc_tag;
  user.start_date = payload.start_date || user.start_date;
  user.end_date = payload.end_date !== undefined ? (payload.end_date || null) : user.end_date;
  user.is_active = body.is_active !== undefined ? payload.is_active : user.is_active;
  user.vacation_days_per_year = payload.vacation_days_per_year !== undefined ? payload.vacation_days_per_year : calculateVacationDaysForCurrentYear(user.start_date, user.end_date);
  user.weekly_hours = payload.weekly_hours || user.weekly_hours;

  if (payload.work_schedule) {
    user.work_schedule = payload.work_schedule;
    user.markModified("work_schedule");
  }

  if (payload.password) {
    if (payload.password.length < 8) {
      throw createHttpError(400, "Passwort muss mindestens 8 Zeichen haben");
    }
    user.password_hash = await bcrypt.hash(payload.password, 10);
  }

  await user.save();
  return { message: "Benutzer erfolgreich aktualisiert" };
}

export async function deleteUser(id) {
  ensureObjectId(id);
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    throw createHttpError(404, "Benutzer nicht gefunden");
  }

  return { message: "Benutzer erfolgreich geloescht" };
}

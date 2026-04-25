import LeaveRequest from "../models/LeaveRequest.js";
import User from "../models/User.js";
import WorkSchedule from "../models/WorkSchedule.js";
import WorkSession from "../models/WorkSession.js";
import { Holiday } from "../models/Holiday.js";
import { ensureObjectId, normalizeTrimmedString, parseIsoDate } from "../utils/request.js";
import { createHttpError } from "../utils/http.js";
import {
  buildHolidayDateSet,
  calculateNetWorkMinutes,
  countScheduledMinutesInRange,
  countWorkingDaysInRange,
  getYearRange,
  iterateDates,
  toDateKey,
} from "../utils/businessTime.js";

const ALLOWED_LEAVE_TYPES = ["vacation", "sick", "other", "overtime"];

export async function createLeaveRequest(user, body) {
  const from = parseIsoDate(body.from, "Ungueltiges Startdatum");
  const to = parseIsoDate(body.to, "Ungueltiges Enddatum");
  const type = ALLOWED_LEAVE_TYPES.includes(body.type) ? body.type : null;
  const reason = normalizeTrimmedString(body.reason, { maxLength: 500 });

  if (!type || !reason) {
    throw createHttpError(400, "Fehlende oder ungueltige Daten");
  }

  if (to < from) {
    throw createHttpError(400, "Enddatum muss nach dem Startdatum liegen");
  }

  const [userProfile, customSchedule, holidayDocs] = await Promise.all([
    User.findById(user.id)
      .select("start_date end_date weekly_hours work_schedule vacation_days_per_year")
      .lean(),
    WorkSchedule.findOne({ user_id: user.id }).lean(),
    Holiday.find({ year: { $in: getYearRange(from, to) } }).lean(),
  ]);

  if (!userProfile) {
    throw createHttpError(404, "Benutzer nicht gefunden");
  }

  const effectiveSchedule = customSchedule?.schedule || userProfile.work_schedule || null;
  const weeklyHours = customSchedule?.weekly_hours || userProfile.weekly_hours || 40;
  const holidayDateSet = buildHolidayDateSet(holidayDocs);
  const workingDaysRequested = countWorkingDaysInRange({
    startDate: from,
    endDate: to,
    schedule: effectiveSchedule,
    weeklyHours,
    holidayDateSet,
    employmentStart: userProfile.start_date,
    employmentEnd: userProfile.end_date,
  });

  if (workingDaysRequested === 0) {
    throw createHttpError(400, "Der Antrag enthaelt keine gueltigen Arbeitstage");
  }

  await ensureNoOverlappingActiveLeave(user.id, from, to);

  if (type === "vacation") {
    await ensureVacationBalance({
      userId: user.id,
      vacationDaysPerYear: userProfile.vacation_days_per_year || 25,
      requestStart: from,
      requestEnd: to,
      schedule: effectiveSchedule,
      weeklyHours,
      holidayDateSet,
      employmentStart: userProfile.start_date,
      employmentEnd: userProfile.end_date,
    });
  }

  if (type === "overtime") {
    await ensureOvertimeBalance({
      userId: user.id,
      requestStart: from,
      requestEnd: to,
      schedule: effectiveSchedule,
      weeklyHours,
      holidayDateSet,
      employmentStart: userProfile.start_date,
      employmentEnd: userProfile.end_date,
    });
  }

  return LeaveRequest.create({
    from,
    to,
    type,
    reason,
    user_id: user.id,
    status: "pending",
  });
}

async function ensureNoOverlappingActiveLeave(userId, from, to) {
  const overlappingRequest = await LeaveRequest.findOne({
    user_id: userId,
    status: { $in: ["pending", "approved"] },
    from: { $lte: to },
    to: { $gte: from },
  }).lean();

  if (overlappingRequest) {
    throw createHttpError(409, "Es existiert bereits ein ueberschneidender Antrag");
  }
}

async function ensureVacationBalance({
  userId,
  vacationDaysPerYear,
  requestStart,
  requestEnd,
  schedule,
  weeklyHours,
  holidayDateSet,
  employmentStart,
  employmentEnd,
}) {
  const activeRequests = await LeaveRequest.find({
    user_id: userId,
    type: "vacation",
    status: { $in: ["pending", "approved"] },
  })
    .select("from to")
    .lean();

  const requestedDaysByYear = countVacationDaysByYear([{
    from: requestStart,
    to: requestEnd,
  }], {
    schedule,
    weeklyHours,
    holidayDateSet,
    employmentStart,
    employmentEnd,
  });

  const reservedDaysByYear = countVacationDaysByYear(activeRequests, {
    schedule,
    weeklyHours,
    holidayDateSet,
    employmentStart,
    employmentEnd,
  });

  for (const [year, requestedDays] of requestedDaysByYear.entries()) {
    const alreadyReservedDays = reservedDaysByYear.get(year) || 0;
    if (alreadyReservedDays + requestedDays > vacationDaysPerYear) {
      throw createHttpError(400, "Urlaubsanspruch fuer den Zeitraum reicht nicht aus");
    }
  }
}

function countVacationDaysByYear(requests, options) {
  const totalsByYear = new Map();

  for (const request of requests) {
    iterateDates(request.from, request.to, (date) => {
      const workingDayCount = countWorkingDaysInRange({
        startDate: date,
        endDate: date,
        ...options,
      });

      if (workingDayCount === 0) {
        return;
      }

      const year = date.getFullYear();
      totalsByYear.set(year, (totalsByYear.get(year) || 0) + 1);
    });
  }

  return totalsByYear;
}

async function ensureOvertimeBalance({
  userId,
  requestStart,
  requestEnd,
  schedule,
  weeklyHours,
  holidayDateSet,
  employmentStart,
  employmentEnd,
}) {
  const cutoff = new Date(requestStart);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(23, 59, 59, 999);

  const periodStart = employmentStart
    ? new Date(Math.max(new Date(employmentStart).getTime(), new Date(requestStart.getFullYear(), 0, 1).getTime()))
    : new Date(requestStart.getFullYear(), 0, 1);

  if (cutoff < periodStart) {
    throw createHttpError(400, "Nicht genug Ueberstunden fuer Zeitausgleich vorhanden");
  }

  const [sessions, approvedLeaves] = await Promise.all([
    WorkSession.find({
      user_id: userId,
      end_time: { $ne: null },
      start_time: { $gte: periodStart, $lte: cutoff },
    })
      .select("date_today start_time end_time pause")
      .lean(),
    LeaveRequest.find({
      user_id: userId,
      status: "approved",
      from: { $lte: cutoff },
      to: { $gte: periodStart },
    })
      .select("from to type")
      .lean(),
  ]);

  const workedMinutes = sessions.reduce(
    (total, session) => total + calculateNetWorkMinutes(session.start_time, session.end_time, session.pause),
    0,
  );

  const regularLeaveDates = new Set();
  const overtimeLeaveDates = new Set();

  for (const leave of approvedLeaves) {
    iterateDates(leave.from, leave.to, (date) => {
      const dateKey = toDateKey(date);
      if (leave.type === "overtime") {
        overtimeLeaveDates.add(dateKey);
      } else {
        regularLeaveDates.add(dateKey);
      }
    });
  }

  let scheduledMinutes = 0;
  let overtimeLeaveMinutes = 0;

  iterateDates(periodStart, cutoff, (date) => {
    const workingDayMinutes = countScheduledMinutesInRange({
      startDate: date,
      endDate: date,
      schedule,
      weeklyHours,
      holidayDateSet,
      employmentStart,
      employmentEnd,
    });

    if (workingDayMinutes === 0) {
      return;
    }

    const dateKey = toDateKey(date);
    if (regularLeaveDates.has(dateKey)) {
      return;
    }

    if (overtimeLeaveDates.has(dateKey)) {
      overtimeLeaveMinutes += workingDayMinutes;
      return;
    }

    scheduledMinutes += workingDayMinutes;
  });

  const requestedMinutes = countScheduledMinutesInRange({
    startDate: requestStart,
    endDate: requestEnd,
    schedule,
    weeklyHours,
    holidayDateSet,
    employmentStart,
    employmentEnd,
  });

  const overtimeBalanceMinutes = workedMinutes - scheduledMinutes - overtimeLeaveMinutes;

  if (requestedMinutes > overtimeBalanceMinutes) {
    throw createHttpError(400, "Nicht genug Ueberstunden fuer Zeitausgleich vorhanden");
  }
}

export async function getOwnLeaveRequests(userId) {
  return LeaveRequest.find({ user_id: userId }).sort({ created_at: -1 }).lean();
}

export async function getLeaveCalendar(user, query) {
  const filter = { status: "approved" };
  if (user.role !== "admin") {
    filter.user_id = user.id;
  } else if (query.userId) {
    filter.user_id = ensureObjectId(query.userId, "Ungueltige Benutzer-ID");
  }

  return LeaveRequest.find(filter)
    .select("user_id from to type reason status decided_by created_at")
    .populate("user_id", "name")
    .lean();
}

export async function getAdminLeaveRequests() {
  return LeaveRequest.find()
    .populate("user_id", "name department")
    .populate("decided_by", "name")
    .sort({ created_at: -1 })
    .lean();
}

async function updateLeaveStatus(id, userId, status) {
  ensureObjectId(id);
  const updated = await LeaveRequest.findByIdAndUpdate(
    id,
    { status, decided_by: userId },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw createHttpError(404, "Antrag nicht gefunden");
  }

  return updated;
}

export function approveLeaveRequest(id, userId) {
  return updateLeaveStatus(id, userId, "approved");
}

export function rejectLeaveRequest(id, userId) {
  return updateLeaveStatus(id, userId, "rejected");
}

export async function deleteLeaveRequest(id, user) {
  ensureObjectId(id);
  const request = await LeaveRequest.findById(id);
  if (!request) {
    throw createHttpError(404, "Antrag nicht gefunden");
  }

  const isOwner = request.user_id.toString() === user.id;
  const isAdmin = user.role === "admin";

  if (!isAdmin && !isOwner) {
    throw createHttpError(403, "Keine Berechtigung zum Loeschen dieses Antrags");
  }

  if (!isAdmin && request.status !== "pending") {
    throw createHttpError(400, "Genehmigte oder abgelehnte Antraege koennen nicht mehr geloescht werden");
  }

  await request.deleteOne();
  return { message: "Antrag erfolgreich geloescht" };
}

import User from "../models/User.js";
import WorkSession from "../models/WorkSession.js";
import Log from "../models/Log.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { Holiday } from "../models/Holiday.js";
import { calculateNetWorkMinutes } from "../utils/businessTime.js";

const VALIDATION_MESSAGES = [
  "Keine Buchung",
  "Kernzeit verletzt (weniger als 5 Stunden)",
  "Arbeitszeit > 10 Stunden (Vorgesetzter gemeldet)",
];

function toDateString(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildHolidayLookup(holidayDocs) {
  const holidaysByYear = new Map();

  for (const doc of holidayDocs) {
    holidaysByYear.set(doc.year, {
      holidays: new Set((doc.holidays || []).map((holiday) => holiday.date)),
      ferien: doc.ferien || [],
    });
  }

  return holidaysByYear;
}

function buildLeaveLookup(leaves) {
  const leaveMap = new Map();

  for (const leave of leaves) {
    const key = String(leave.user_id);
    if (!leaveMap.has(key)) {
      leaveMap.set(key, []);
    }

    leaveMap.get(key).push({
      from: new Date(leave.from),
      to: new Date(leave.to),
    });
  }

  return leaveMap;
}

function buildSessionLookup(sessions) {
  const sessionMap = new Map();

  for (const session of sessions) {
    sessionMap.set(`${session.user_id}:${session.date_today}`, session);
  }

  return sessionMap;
}

function isCoveredByLeave(leaveEntries, currentDate) {
  if (!leaveEntries?.length) return false;
  return leaveEntries.some((leave) => leave.from <= currentDate && leave.to >= currentDate);
}

export async function checkDailyLogs() {
  console.log("Starte taegliche Validierung...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const users = await User.find({
    is_active: true,
    start_date: { $ne: null },
  })
    .select("_id start_date")
    .lean();

  if (users.length === 0) {
    return;
  }

  const minStartDate = new Date(
    Math.min(...users.map((user) => new Date(user.start_date).setHours(0, 0, 0, 0))),
  );
  const years = Array.from(
    new Set(
      Array.from(
        { length: yesterday.getFullYear() - minStartDate.getFullYear() + 1 },
        (_, index) => minStartDate.getFullYear() + index,
      ),
    ),
  );
  const userIds = users.map((user) => user._id);
  const minStartDateString = toDateString(minStartDate);
  const yesterdayString = toDateString(yesterday);

  const [holidayDocs, approvedLeaves, sessions] = await Promise.all([
    Holiday.find({ year: { $in: years } }).lean(),
    LeaveRequest.find({
      status: "approved",
      user_id: { $in: userIds },
      from: { $lte: yesterday },
      to: { $gte: minStartDate },
    })
      .select("user_id from to")
      .lean(),
    WorkSession.find({
      user_id: { $in: userIds },
      date_today: { $gte: minStartDateString, $lte: yesterdayString },
    })
      .select("user_id date_today start_time end_time pause")
      .lean(),
  ]);

  const holidaysByYear = buildHolidayLookup(holidayDocs);
  const leavesByUser = buildLeaveLookup(approvedLeaves);
  const sessionsByUserAndDate = buildSessionLookup(sessions);
  const desiredLogs = [];

  for (const user of users) {
    const startDate = new Date(user.start_date);
    startDate.setHours(0, 0, 0, 0);

    for (let current = new Date(startDate); current <= yesterday; current.setDate(current.getDate() + 1)) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      const dateStr = toDateString(current);
      const holidayEntry = holidaysByYear.get(current.getFullYear());
      const isHoliday = holidayEntry?.holidays.has(dateStr);
      const isFerien = holidayEntry?.ferien.some(
        (ferien) => dateStr >= ferien.start && dateStr <= ferien.end,
      );

      if (isHoliday || isFerien) {
        continue;
      }

      const leaveEntries = leavesByUser.get(String(user._id));
      if (isCoveredByLeave(leaveEntries, current)) {
        continue;
      }

      const session = sessionsByUserAndDate.get(`${user._id}:${dateStr}`);
      if (!session) {
        desiredLogs.push({
          user_id: user._id,
          violation_date: dateStr,
          message: "Keine Buchung",
          level: "ERROR",
          created_at: new Date(),
        });
        continue;
      }

      if (!session.start_time || !session.end_time) {
        continue;
      }

      const netHours = calculateNetWorkMinutes(
        session.start_time,
        session.end_time,
        session.pause,
      ) / 60;

      if (netHours < 5) {
        desiredLogs.push({
          user_id: user._id,
          violation_date: dateStr,
          message: "Kernzeit verletzt (weniger als 5 Stunden)",
          level: "WARN",
          created_at: new Date(),
        });
      } else if (netHours > 10) {
        desiredLogs.push({
          user_id: user._id,
          violation_date: dateStr,
          message: "Arbeitszeit > 10 Stunden (Vorgesetzter gemeldet)",
          level: "WARN",
          created_at: new Date(),
        });
      }
    }
  }

  await Log.deleteMany({
    user_id: { $in: userIds },
    violation_date: { $gte: minStartDateString, $lte: yesterdayString },
    message: { $in: VALIDATION_MESSAGES },
  });

  if (desiredLogs.length > 0) {
    await Log.insertMany(desiredLogs, { ordered: false });
  }

  console.log("Validierung abgeschlossen.");
}

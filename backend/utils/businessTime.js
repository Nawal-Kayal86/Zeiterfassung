const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function toDateKey(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseTimeToMinutes(value) {
  if (typeof value !== "string" || !value.includes(":")) {
    return 0;
  }

  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

export function parsePauseToMinutes(value) {
  return parseTimeToMinutes(value);
}

export function getDefaultDailyMinutes(weeklyHours = 40) {
  return Math.round((Number(weeklyHours) || 40) * 60 / 5);
}

export function getScheduleEntryForDate(date, schedule) {
  if (!schedule) {
    return null;
  }

  return schedule[DAY_KEYS[date.getDay()]] || null;
}

export function getScheduledMinutesForDate(date, schedule, weeklyHours = 40) {
  const scheduleEntry = getScheduleEntryForDate(date, schedule);
  const fallbackMinutes = getDefaultDailyMinutes(weeklyHours);

  if (!scheduleEntry) {
    return date.getDay() === 0 || date.getDay() === 6 ? 0 : fallbackMinutes;
  }

  if (!scheduleEntry.active) {
    return 0;
  }

  const plannedMinutes =
    parseTimeToMinutes(scheduleEntry.to) - parseTimeToMinutes(scheduleEntry.from);

  return plannedMinutes > 0 ? plannedMinutes : fallbackMinutes;
}

export function calculateNetWorkMinutes(startTime, endTime, pause) {
  if (!startTime || !endTime) {
    return 0;
  }

  const grossMinutes = Math.floor((new Date(endTime) - new Date(startTime)) / 60000);
  if (grossMinutes <= 0) {
    return 0;
  }

  return Math.max(grossMinutes - parsePauseToMinutes(pause), 0);
}

export function buildHolidayDateSet(holidayDocs) {
  return new Set(
    (holidayDocs || []).flatMap((doc) => (doc.holidays || []).map((holiday) => holiday.date)),
  );
}

export function getYearRange(startDate, endDate) {
  const startYear = new Date(startDate).getFullYear();
  const endYear = new Date(endDate).getFullYear();
  const years = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year);
  }

  return years;
}

export function iterateDates(startDate, endDate, iteratee) {
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);

  const limit = new Date(endDate);
  limit.setHours(0, 0, 0, 0);

  while (cursor <= limit) {
    iteratee(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
}

export function countWorkingDaysInRange({
  startDate,
  endDate,
  schedule,
  weeklyHours,
  holidayDateSet,
  employmentStart,
  employmentEnd,
}) {
  let workingDays = 0;

  iterateDates(startDate, endDate, (date) => {
    if (!isWorkingDate(date, {
      schedule,
      weeklyHours,
      holidayDateSet,
      employmentStart,
      employmentEnd,
    })) {
      return;
    }

    workingDays += 1;
  });

  return workingDays;
}

export function countScheduledMinutesInRange({
  startDate,
  endDate,
  schedule,
  weeklyHours,
  holidayDateSet,
  employmentStart,
  employmentEnd,
}) {
  let scheduledMinutes = 0;

  iterateDates(startDate, endDate, (date) => {
    if (!isWorkingDate(date, {
      schedule,
      weeklyHours,
      holidayDateSet,
      employmentStart,
      employmentEnd,
    })) {
      return;
    }

    scheduledMinutes += getScheduledMinutesForDate(date, schedule, weeklyHours);
  });

  return scheduledMinutes;
}

function isWorkingDate(date, {
  schedule,
  weeklyHours,
  holidayDateSet,
  employmentStart,
  employmentEnd,
}) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  if (employmentStart) {
    const start = new Date(employmentStart);
    start.setHours(0, 0, 0, 0);
    if (normalizedDate < start) {
      return false;
    }
  }

  if (employmentEnd) {
    const end = new Date(employmentEnd);
    end.setHours(0, 0, 0, 0);
    if (normalizedDate > end) {
      return false;
    }
  }

  const dateKey = toDateKey(normalizedDate);
  if (holidayDateSet?.has(dateKey)) {
    return false;
  }

  return getScheduledMinutesForDate(normalizedDate, schedule, weeklyHours) > 0;
}

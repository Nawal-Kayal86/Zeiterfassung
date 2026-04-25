import WorkSession from "../models/WorkSession.js";
import { ensureObjectId, parseDateTimeParts, sanitizePause } from "../utils/request.js";
import { createHttpError } from "../utils/http.js";

const INVALID_USER_ID_ERROR = "Ungueltige Benutzer-ID";
const OPEN_SESSION_ERROR = "Es existiert bereits eine offene Arbeitszeit";
const MISSING_OPEN_SESSION_ERROR = "Keine offene Arbeitszeit vorhanden";
const INVALID_TIME_ORDER_ERROR = "Endzeit muss nach Startzeit liegen";
const SESSION_NOT_FOUND_ERROR = "Sitzung nicht gefunden";
const PERMISSION_ERROR = "Keine Berechtigung";

function resolveTargetUserId(user, requestedUserId) {
  if (user.role !== "admin" || !requestedUserId) {
    return user.id;
  }

  return ensureObjectId(requestedUserId, INVALID_USER_ID_ERROR);
}

function getTodayDateKey() {
  return new Date().toISOString().split("T")[0];
}

async function findOpenSession(userId, options = {}) {
  const query = WorkSession.findOne({
    user_id: userId,
    end_time: null,
  });

  if (options.lean) {
    query.lean();
  }

  return query;
}

function validateManualWorkSession(date, start, end) {
  if (!date || (!start && !end)) {
    throw createHttpError(400, "Datum und mindestens Start oder Ende erforderlich");
  }
}

function ensureEndAfterStart(startTime, endTime, message = INVALID_TIME_ORDER_ERROR) {
  if (endTime <= startTime) {
    throw createHttpError(400, message);
  }
}

async function closeOpenSession(openSession, endTime, pause) {
  ensureEndAfterStart(openSession.start_time, endTime);
  openSession.end_time = endTime;
  openSession.pause = pause;
  await openSession.save();
  return openSession;
}

async function createSession(sessionData) {
  return WorkSession.create(sessionData);
}

function buildSessionQuery(user, queryParams) {
  const { userId, startDate, endDate } = queryParams;
  const query = {};

  if (user.role !== "admin") {
    query.user_id = user.id;
  } else if (userId) {
    query.user_id = ensureObjectId(userId, INVALID_USER_ID_ERROR);
  }

  if (startDate || endDate) {
    query.start_time = {};

    if (startDate) {
      query.start_time.$gte = new Date(startDate);
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.start_time.$lte = endOfDay;
    }
  }

  return query;
}

function mapSessionListItem(session) {
  return {
    id: session._id,
    user_id: session.user_id?._id || session.user_id,
    name: session.user_id?.name || "-",
    department: session.user_id?.department || "-",
    start: session.start_time ? new Date(session.start_time).toISOString() : null,
    end: session.end_time ? new Date(session.end_time).toISOString() : null,
    date_today: session.date_today,
    pause: session.pause || "0:00",
  };
}

async function findAuthorizedSession(sessionId, user) {
  ensureObjectId(sessionId);

  const session = await WorkSession.findById(sessionId);
  if (!session) {
    throw createHttpError(404, SESSION_NOT_FOUND_ERROR);
  }

  if (user.role !== "admin" && session.user_id.toString() !== user.id) {
    throw createHttpError(403, PERMISSION_ERROR);
  }

  return session;
}

export async function startWorkSession(user) {
  const openSession = await findOpenSession(user.id, { lean: true });

  if (openSession) {
    throw createHttpError(400, OPEN_SESSION_ERROR);
  }

  const session = await createSession({
    user_id: user.id,
    start_time: new Date(),
    date_today: getTodayDateKey(),
  });

  return { message: "Arbeitsbeginn erfasst", session };
}

export async function stopWorkSession(user, body) {
  const openSession = await findOpenSession(user.id);

  if (!openSession) {
    throw createHttpError(400, MISSING_OPEN_SESSION_ERROR);
  }

  const closedSession = await closeOpenSession(
    openSession,
    new Date(),
    sanitizePause(body.pause),
  );

  return { message: "Arbeitsende erfasst", session: closedSession };
}

export async function saveManualWorkSession(user, body) {
  const { date, start, end } = body;
  const targetUserId = resolveTargetUserId(user, body.userId);
  const pause = sanitizePause(body.pause);

  validateManualWorkSession(date, start, end);

  const startDateTime = parseDateTimeParts(date, start);
  const endDateTime = parseDateTimeParts(date, end);
  const openSession = await findOpenSession(targetUserId);

  if (!start && end) {
    if (!openSession) {
      throw createHttpError(400, "Keine offene Startzeit vorhanden");
    }

    const closedSession = await closeOpenSession(openSession, endDateTime, pause);
    return { message: "Offene Arbeitszeit beendet", session: closedSession };
  }

  if (start && !end) {
    if (openSession) {
      throw createHttpError(400, "Es gibt bereits eine offene Startzeit");
    }

    const session = await createSession({
      user_id: targetUserId,
      start_time: startDateTime,
      date_today: date,
      pause,
    });

    return { message: "Arbeitsbeginn manuell erfasst", session };
  }

  ensureEndAfterStart(startDateTime, endDateTime);

  const existingSession = await WorkSession.findOne({
    user_id: targetUserId,
    date_today: date,
  });

  if (existingSession) {
    existingSession.start_time = startDateTime;
    existingSession.end_time = endDateTime;
    existingSession.pause = pause;
    await existingSession.save();

    return {
      message: "Arbeitszeit fuer diesen Tag aktualisiert",
      session: existingSession,
    };
  }

  const session = await createSession({
    user_id: targetUserId,
    start_time: startDateTime,
    end_time: endDateTime,
    date_today: date,
    pause,
  });

  return { message: "Arbeitszeit manuell erfasst", session };
}

export async function getWorkSessions(user, queryParams) {
  const query = buildSessionQuery(user, queryParams);

  const sessions = await WorkSession.find(query)
    .select("user_id start_time end_time date_today pause")
    .sort({ start_time: -1 })
    .populate("user_id", "name department")
    .lean();

  return sessions.map(mapSessionListItem);
}

export async function getWorkSessionSummary(user, query) {
  const filter = {
    user_id:
      user.role === "admin" && query.userId
        ? ensureObjectId(query.userId, INVALID_USER_ID_ERROR)
        : user.id,
  };

  const [summary] = await WorkSession.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        lastStart: { $max: "$start_time" },
        lastEnd: { $max: "$end_time" },
      },
    },
  ]);

  return {
    lastStart: summary?.lastStart || null,
    lastEnd: summary?.lastEnd || null,
    totalEntries: summary?.totalEntries || 0,
  };
}

export async function deleteWorkSession(id, user) {
  const session = await findAuthorizedSession(id, user);
  await session.deleteOne();
  return { message: "Arbeitszeit geloescht" };
}

export async function updateWorkSession(id, user, body) {
  const session = await findAuthorizedSession(id, user);

  if (body.start) {
    session.start_time = new Date(body.start);
  }

  if (body.end) {
    session.end_time = new Date(body.end);
  }

  if (body.pause !== undefined) {
    session.pause = sanitizePause(body.pause);
  }

  if (session.end_time && session.start_time) {
    ensureEndAfterStart(
      session.start_time,
      session.end_time,
      "Endzeit muss nach der Startzeit liegen",
    );
  }

  await session.save();
  return { message: "Arbeitszeit aktualisiert", session };
}

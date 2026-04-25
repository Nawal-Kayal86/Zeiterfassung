function normalizeLevel(level) {
  return typeof level === "string" ? level.toLowerCase() : "info";
}

function writeLog(level, message, context = {}) {
  const normalizedLevel = normalizeLevel(level);
  const payload = {
    timestamp: new Date().toISOString(),
    level: normalizedLevel,
    service: process.env.RENDER_SERVICE_NAME || "zeiterfassung-backend",
    environment: process.env.NODE_ENV || "development",
    message,
    ...sanitizeContext(context),
  };

  const serialized = JSON.stringify(payload);
  if (normalizedLevel === "error" || normalizedLevel === "critical") {
    console.error(serialized);
    return;
  }

  console.log(serialized);
}

function sanitizeContext(context) {
  if (!context || typeof context !== "object") {
    return {};
  }

  const nextContext = { ...context };

  if (nextContext.error instanceof Error) {
    nextContext.error = {
      name: nextContext.error.name,
      message: nextContext.error.message,
      stack: nextContext.error.stack,
    };
  }

  return nextContext;
}

export const logger = {
  debug(message, context) {
    writeLog("debug", message, context);
  },
  info(message, context) {
    writeLog("info", message, context);
  },
  warn(message, context) {
    writeLog("warning", message, context);
  },
  error(message, context) {
    writeLog("error", message, context);
  },
};

export function buildRequestLoggerContext(req, extra = {}) {
  return {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    userAgent: req.get("user-agent"),
    remoteIp: req.ip,
    ...extra,
  };
}

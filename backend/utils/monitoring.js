import { logger } from "./logger.js";

let sentryModule = null;
let sentryInitialized = false;

export async function initMonitoring() {
  if (!process.env.SENTRY_DSN || sentryInitialized) {
    return;
  }

  try {
    const Sentry = await import("@sentry/node");

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "production",
      release: process.env.SENTRY_RELEASE || process.env.RENDER_GIT_COMMIT || undefined,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
    });

    sentryModule = Sentry;
    sentryInitialized = true;
    logger.info("Sentry initialisiert");
  } catch (error) {
    logger.error("Sentry konnte nicht initialisiert werden", { error });
  }
}

export function monitoringRequestHandler(req, res, next) {
  if (sentryModule?.setUser && req.user?.id) {
    sentryModule.setUser({ id: req.user.id });
  }

  next();
}

export function captureException(error, context = {}) {
  if (sentryModule?.captureException) {
    sentryModule.captureException(error, {
      extra: context,
    });
  }
}

export async function flushMonitoring(timeout = 2000) {
  if (!sentryModule?.flush) {
    return true;
  }

  try {
    return await sentryModule.flush(timeout);
  } catch (error) {
    logger.error("Monitoring-Flush fehlgeschlagen", { error });
    return false;
  }
}

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/index.js";
import { rejectMaliciousPayload, securityHeaders } from "./middleware/security.js";
import { sendError } from "./utils/http.js";
import { getDatabaseStatus } from "./db.js";
import { logger, buildRequestLoggerContext } from "./utils/logger.js";
import { captureException, monitoringRequestHandler } from "./utils/monitoring.js";

export function createApp(options = {}) {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";
  const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const shouldServeStatic = options.serveStatic !== false;

  app.locals.serverDir = __dirname;
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use((req, res, next) => {
    req.requestId = req.get("rndr-id") || req.get("x-request-id") || crypto.randomUUID();
    res.setHeader("X-Request-Id", req.requestId);

    const startedAt = Date.now();
    res.on("finish", () => {
      logger.info("HTTP request completed", buildRequestLoggerContext(req, {
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      }));
    });

    next();
  });
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
          return callback(null, true);
        }

        return callback(new Error("CORS blockiert diesen Ursprung"));
      },
      credentials: true,
    }),
  );
  app.use(bodyParser.json({ limit: "10kb" }));
  app.use(rejectMaliciousPayload);
  app.use(monitoringRequestHandler);

  app.get("/healthz", (req, res) => {
    const dbStatus = getDatabaseStatus();
    res.status(200).json({
      ok: true,
      service: "zeiterfassung-backend",
      database: dbStatus.connected ? "up" : "down",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/readyz", (req, res) => {
    const dbStatus = getDatabaseStatus();
    if (!dbStatus.connected) {
      return sendError(res, 503, "Datenbank nicht bereit", {
        requestId: req.requestId,
      });
    }

    return res.status(200).json({
      ok: true,
      service: "zeiterfassung-backend",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", apiRoutes);

  app.use((error, req, res, next) => {
    captureException(error, buildRequestLoggerContext(req));

    if (error?.message === "CORS blockiert diesen Ursprung") {
      return sendError(res, 403, error.message);
    }

    if (error?.status) {
      logger.warn("HTTP request failed", buildRequestLoggerContext(req, {
        statusCode: error.status,
        error: error.message,
      }));
      return sendError(res, error.status, error.message);
    }

    logger.error("Unbehandelter Serverfehler", buildRequestLoggerContext(req, {
      error,
    }));
    return sendError(res, 500, "Serverfehler");
  });

  if (shouldServeStatic) {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return sendError(res, 404, "API-Endpunkt nicht gefunden");
      }

      return res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
  }

  return app;
}

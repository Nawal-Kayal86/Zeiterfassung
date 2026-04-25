import dotenv from "dotenv";
import { initDB } from "./db.js";
import { createApp } from "./app.js";
import { logger } from "./utils/logger.js";
import { flushMonitoring, initMonitoring } from "./utils/monitoring.js";

dotenv.config();
await initMonitoring();
await initDB();

const app = createApp();
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info("Backend gestartet", {
    port: PORT,
    nodeVersion: process.version,
    renderService: process.env.RENDER_SERVICE_NAME || null,
  });
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, async () => {
    logger.info("Shutdown-Signal empfangen", { signal });

    server.close(async () => {
      await flushMonitoring();
      logger.info("HTTP-Server sauber beendet");
      process.exit(0);
    });

    setTimeout(async () => {
      logger.warn("Shutdown-Timeout erreicht, Prozess wird beendet");
      await flushMonitoring();
      process.exit(1);
    }, Number(process.env.SHUTDOWN_TIMEOUT_MS || 25000)).unref();
  });
}

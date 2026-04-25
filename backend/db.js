import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";
dotenv.config();

let isConnected = false;

export async function initDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;

    logger.info("MongoDB verbunden", {
      database: conn.connection.name || "unbekannt",
      host: conn.connection.host || "unbekannt",
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB getrennt. Versuche erneut zu verbinden...");
      isConnected = false;
    });
  } catch (err) {
    logger.error("MongoDB Fehler", { error: err });
    throw err;
  }
}

export function getDatabaseStatus() {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

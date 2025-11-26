import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let isConnected = false;

export async function initDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;

    console.log(`MongoDB verbunden: ${conn.connection.name || "unbekannt"}`);
    console.log(`MongoDB Host: ${conn.connection.host || "unbekannt"}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB getrennt. Versuche erneut zu verbinden...");
      isConnected = false;
    });

  } catch (err) {
    console.error("MongoDB Fehler:", err);
    throw err;
  }
}

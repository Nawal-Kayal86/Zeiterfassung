import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ["INFO","WARN","ERROR"], default: "INFO" },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Log", LogSchema);

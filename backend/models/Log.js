import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ["INFO", "WARN", "ERROR"], default: "INFO" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  violation_date: { type: String, default: null }, // YYYY-MM-DD
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Log", LogSchema);

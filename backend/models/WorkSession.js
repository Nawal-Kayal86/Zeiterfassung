import mongoose from "mongoose";

const WorkSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  start_time: { type: Date, default: null },
  end_time: { type: Date, default: null },
  date_today: { type: String, required: true }
});

export default mongoose.model("WorkSession", WorkSessionSchema);

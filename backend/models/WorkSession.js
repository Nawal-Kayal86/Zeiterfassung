import mongoose from "mongoose";

const WorkSessionSchema = new mongoose.Schema({
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  start_time:{ type: Date, required: true },
  end_time:  { type: Date }
});

export default mongoose.model("WorkSession", WorkSessionSchema);

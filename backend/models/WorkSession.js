import mongoose from "mongoose";

const WorkSessionSchema = new mongoose.Schema({
<<<<<<< HEAD
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  start_time: { type: Date, default: null },
  end_time: { type: Date, default: null },
  date_today: { type: String, required: true }
=======
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  start_time:{ type: Date, required: true },
  end_time:  { type: Date }
>>>>>>> 13d1e08ccbda6ef44a5cc3db97539d9511538d7c
});

export default mongoose.model("WorkSession", WorkSessionSchema);

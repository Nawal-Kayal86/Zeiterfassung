import mongoose from "mongoose";

const WorkflowSchema = new mongoose.Schema({
  task: { type: String, required: true },
  status: { type: String, enum: ["open","done"], default: "open" },
  created_at: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

export default mongoose.model("Workflow", WorkflowSchema);


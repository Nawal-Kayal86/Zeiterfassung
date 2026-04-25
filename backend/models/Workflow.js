import mongoose from "mongoose";

const WorkflowSchema = new mongoose.Schema({
  task: { type: String, required: true },
  status: { type: String, enum: ["open", "done"], default: "open" },
  created_at: { type: Date, default: Date.now },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

WorkflowSchema.index({ user_id: 1, created_at: -1 });
WorkflowSchema.index({ status: 1, created_at: -1 });

export default mongoose.model("Workflow", WorkflowSchema);

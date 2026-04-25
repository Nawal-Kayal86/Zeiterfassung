import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  from: { type: Date, required: true },
  to: { type: Date, required: true },

  type: {
    type: String,
    enum: ["vacation", "sick", "other", "overtime"], // ✅ Entspricht Vue
    required: true,
  },

  reason: { type: String, required: true },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  decided_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

LeaveRequestSchema.index({ user_id: 1, status: 1, created_at: -1 });
LeaveRequestSchema.index({ user_id: 1, from: 1, to: 1 });
LeaveRequestSchema.index({ status: 1, from: 1, to: 1, user_id: 1 });

export default mongoose.model("LeaveRequest", LeaveRequestSchema);

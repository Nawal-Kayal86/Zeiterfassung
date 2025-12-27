import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  from: { type: Date, required: true },
  to: { type: Date, required: true },

  type: {
    type: String,
    enum: ["vacation", "sick", "other"], // ✅ نفس Vue
    required: true
  },

  reason: { type: String, required: true },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("LeaveRequest", LeaveRequestSchema);

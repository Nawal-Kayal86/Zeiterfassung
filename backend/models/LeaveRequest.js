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
    enum: ["annual", "sick", "unpaid"],
    default: "annual"
  },

  reason: { type: String },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  decided_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export default mongoose.model("LeaveRequest", LeaveRequestSchema);

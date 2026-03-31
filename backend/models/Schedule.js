import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    department: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    shift: {
      type: String,
      enum: ["Frühschicht", "Spätschicht", "Nachtschicht"],
      required: true,
    },

    start_time: {
      type: String, // "06:00"
      required: false,
    },

    end_time: {
      type: String, // "14:00"
      required: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Schedule", scheduleSchema);

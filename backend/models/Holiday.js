import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema({
  year: { type: Number, required: true },
  state: { type: String, default: "W" }, // Bundesland (z.B. W für Wien)
  holidays: [
    {
      date: String, // YYYY-MM-DD
      name: String,
    },
  ],
  ferien: [
    {
      name: String,
      start: String, // YYYY-MM-DD
      end: String,   // YYYY-MM-DD
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

// Verhindert doppelte Einträge für das gleiche Jahr + Bundesland
HolidaySchema.index({ year: 1, state: 1 }, { unique: true });

export const Holiday = mongoose.model("Holiday", HolidaySchema);
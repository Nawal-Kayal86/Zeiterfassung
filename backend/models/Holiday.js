import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  year: { type: Number, required: true },
  country: { type: String, default: "AT" },
  state: { type: String, default: "W" }, // Wien
  region: { type: String, default: "Wien" },
  holidays: [
    { date: String, name: String } // YYYY-MM-DD
  ],
  ferien: [
    { name: String, start: String, end: String }
  ],
  updatedAt: { type: Date, default: Date.now }
});

export const Holiday = mongoose.model("Holiday", holidaySchema);

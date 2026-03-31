import mongoose from "mongoose";

/**
 * @module WorkScheduleModel
 * @description Definiert den Arbeitszeitplan eines Benutzers.
 * Trennt die Dienstplanung vom User-Hauptdatensatz für bessere Wartbarkeit.
 */
const WorkScheduleSchema = new mongoose.Schema({
  // Referenz zum Benutzer
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // Ein Dienstplan pro Benutzer
  },

  // Wöchentliche Sollarbeitszeit
  weekly_hours: { type: Number, default: 40 },

  // Detaillierter Tagesplan
  schedule: {
    mon: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    tue: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    wed: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    thu: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    fri: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    sat: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: false } },
    sun: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: false } },
  },

  updated_at: { type: Date, default: Date.now },
});

// Automatisch den Zeitstempel bei jedem Save aktualisieren
WorkScheduleSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model("WorkSchedule", WorkScheduleSchema);

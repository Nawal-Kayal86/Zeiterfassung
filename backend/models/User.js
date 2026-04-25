import mongoose from "mongoose";

/**
 * @module UserModel
 * @description Definiert das Datenschema für einen Anwender (Mitarbeiter/Admin) im System.
 * Verwaltet essenzielle Zugangsdaten, Berechtigungsrollen und Profilinformationen.
 */
const UserSchema = new mongoose.Schema({
  // Eindeutiger Login-Name
  name: { type: String, required: true, unique: true },

  // Kommunikations-Adresse
  email: { type: String, required: true, unique: true },

  // Hierarchische Rechteverwaltung (Role-Based Access Control)
  role: { type: String, enum: ["user", "admin", "employee", "department_leader"], default: "user" },

  // Zuordnung zu einer Unternehmensabteilung (z.B. "Sales")
  department: { type: String, default: null },

  // Physischer NFC-Tag zur Identifikation an Hardware-Terminals
  nfc_tag: { type: String, default: null, unique: true, sparse: true },

  // Kryptografisch gehashter String (via bcrypt) - niemals Klartext!
  password_hash: { type: String, required: true },

  // Eintrittsdatum ins Unternehmen
  start_date: { type: Date, default: null },

  // Austrittsdatum aus dem Unternehmen
  end_date: { type: Date, default: null },

  // Status (Soft-Delete Flag, um Nutzer zu deaktivieren statt hart zu löschen)
  is_active: { type: Boolean, default: true },

  // Jährlicher Urlaubsanspruch in Tagen
  vacation_days_per_year: { type: Number, default: 25 },

  // Wöchentliche Sollarbeitszeit (z.B. 40 oder 38.5)
  weekly_hours: { type: Number, default: 40 },

  // Detaillierter Arbeitszeitplan pro Tag
  work_schedule: {
    mon: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    tue: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    wed: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    thu: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    fri: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: true } },
    sat: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: false } },
    sun: { from: { type: String, default: "08:00" }, to: { type: String, default: "16:00" }, active: { type: Boolean, default: false } },
  },

  // Metadaten zur Datensatzerstellung
  created_at: { type: Date, default: Date.now },
});

UserSchema.index({ is_active: 1, start_date: 1 });
UserSchema.index({ department: 1 });

export default mongoose.model("User", UserSchema);

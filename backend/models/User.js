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
  role: { type: String, enum: ["user", "admin", "employee"], default: "user" },
  
  // Zuordnung zu einer Unternehmensabteilung (z.B. "Sales")
  department: { type: String, default: null },
  
  // Physischer NFC-Tag zur Identifikation an Hardware-Terminals
  nfc_tag: { type: String, default: null, unique: true, sparse: true },
  
  // Kryptografisch gehashter String (via bcrypt) - niemals Klartext!
  password_hash: { type: String, required: true },
  
  // Eintrittsdatum ins Unternehmen
  start_date: { type: Date, default: null },
  
  // Status (Soft-Delete Flag, um Nutzer zu deaktivieren statt hart zu löschen)
  is_active: { type: Boolean, default: true },
  
  // Metadaten zur Datensatzerstellung
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);

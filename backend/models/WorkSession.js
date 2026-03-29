import mongoose from "mongoose";

/**
 * @module WorkSessionModel
 * @description Definiert das Datenmodell (Schema) für eine Arbeitsschicht (Stempelung) in der MongoDB.
 * Speichert Zeiten, abrechnungsrelevante Felder und referenziert den jeweiligen Mitarbeiter.
 */
const WorkSessionSchema = new mongoose.Schema({
  // Verknüpfung zum Mitarbeiter (User Model)
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Datums-Identifikator zum einfachen Filtern (z.B. "2024-05-12")
  date_today: { type: String, required: true },

  // ====================
  // 🕒 Arbeitszeit-Daten
  // ====================
  start_time: { type: Date, default: null }, // Zeitstempel für asynchronen Arbeitsbeginn ("Kommen")
  end_time: { type: Date, default: null },   // Zeitstempel für asynchrones Arbeitsende ("Gehen")
  pause: { type: String, default: "0:00" },  // Eingelegte Pausendauer im Format "HH:mm"

  // =============================
  // 💶 Abrechnungs-/Gehaltsspalten
  // =============================
  zeitmodell: { type: String, default: null }, 
  stempelungen: { type: String, default: null }, // Log der tatsächlichen Stempelungen des Tages
  bewertung: { type: String, default: null },
  
  // Zeit-Kalkulationen
  ist: { type: String, default: null }, // Tatsächlich gearbeitete Ist-Stunden (z.B. "8:26")
  soll: { type: String, default: "8:15" }, // Vorgeschriebene Soll-Stunden pro Arbeitstag
  uebertrag: { type: String, default: "0:00" }, // Saldo-Übertrag vom Vortag

  // Weitere administrative Felder (Gleitzeit/Zuschläge/Sonderfälle)
  oneToOneDay: { type: String, default: null },
  oneToOneGesamt: { type: String, default: null },
  zgu: { type: String, default: "0:00" },
  salGes: { type: String, default: null }, // Gesamtsaldo
  davonER: { type: String, default: null },
  sab: { type: String, default: null },
  pausch: { type: String, default: null },
  bfVerpl: { type: String, default: null },
  bfRest: { type: String, default: null },
});

export default mongoose.model("WorkSession", WorkSessionSchema);

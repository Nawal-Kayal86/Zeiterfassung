import mongoose from "mongoose";

const WorkSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date_today: { type: String, required: true },

  // Arbeitszeit
  start_time: { type: Date, default: null },
  end_time: { type: Date, default: null },
  pause: { type: String, default: "0:00" },

  // Abrechnungsspalten
  zeitmodell: { type: String, default: null },
  stempelungen: { type: String, default: null },
  bewertung: { type: String, default: null },
  ist: { type: String, default: null }, // z.B. "8:26"
  soll: { type: String, default: "8:15" },
  uebertrag: { type: String, default: "0:00" },
  oneToOneDay: { type: String, default: null },
  oneToOneGesamt: { type: String, default: null },
  zgu: { type: String, default: "0:00" },
  salGes: { type: String, default: null },
  davonER: { type: String, default: null },
  sab: { type: String, default: null },
  pausch: { type: String, default: null },
  bfVerpl: { type: String, default: null },
  bfRest: { type: String, default: null },
});

export default mongoose.model("WorkSession", WorkSessionSchema);

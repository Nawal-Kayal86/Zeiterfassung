import express from "express";
import WorkSchedule from "../models/WorkSchedule.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route GET /api/schedules/:userId
 * @desc Gibt den Dienstplan eines Benutzers zurück (oder Standardwerte)
 */
router.get("/:userId", auth(), async (req, res) => {
  try {
    let schedule = await WorkSchedule.findOne({ user_id: req.params.userId });
    
    // Falls noch kein Plan in der DB steht, schicken wir Standardwerte zurück
    // (Diese werden dann beim ersten Speichern in die DB geschrieben)
    if (!schedule) {
      return res.json({
        user_id: req.params.userId,
        weekly_hours: 40,
        schedule: {
          mon: { from: "08:00", to: "16:00", active: true },
          tue: { from: "08:00", to: "16:00", active: true },
          wed: { from: "08:00", to: "16:00", active: true },
          thu: { from: "08:00", to: "16:00", active: true },
          fri: { from: "08:00", to: "16:00", active: true },
          sat: { from: "08:00", to: "16:00", active: false },
          sun: { from: "08:00", to: "16:00", active: false },
        },
        is_default: true
      });
    }
    
    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden des Dienstplans" });
  }
});

/**
 * @route POST /api/schedules
 * @desc Erstellt oder aktualisiert einen Dienstplan (Upsert)
 */
router.post("/", auth("admin"), async (req, res) => {
  try {
    const { user_id, weekly_hours, schedule } = req.body;
    
    if (!user_id) return res.status(400).json({ error: "Benutzer-ID fehlt" });

    // Suchen und updaten oder neu anlegen (Upsert)
    const updatedSchedule = await WorkSchedule.findOneAndUpdate(
      { user_id },
      { weekly_hours, schedule, updated_at: Date.now() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Dienstplan erfolgreich gespeichert", schedule: updatedSchedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Speichern des Dienstplans" });
  }
});

export default router;

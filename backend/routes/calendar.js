import express from "express";
import { Holiday } from "../models/Holiday.js";

const router = express.Router();

// GET: Kalenderdaten für Jahr
router.get("/", async (req, res) => {
  const { year, state = "W" } = req.query;
  try {
    const data = await Holiday.findOne({ year, state });
    // Falls noch keine Daten existieren, leeres Gerüst zurückgeben (statt 404 Fehler)
    if (!data) {
      return res.json({ year, state, holidays: [], ferien: [] });
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST/PUT: Feiertage & Ferien speichern/updaten
router.post("/", async (req, res) => {
  const { year, state = "W", holidays, ferien } = req.body;
  try {
    const doc = await Holiday.findOneAndUpdate(
      { year, state },
      { holidays, ferien, updatedAt: new Date() },
      { upsert: true, new: true },
    );
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

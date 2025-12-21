// routes/workSessions.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import WorkSession from '../models/WorkSession.js';
import User from '../models/User.js';

const router = express.Router();

// 🟢 Arbeitsbeginn
router.post("/start", auth(), async (req, res) => {
  try {
    const now = new Date();
    const date_today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const session = await WorkSession.create({
      user_id: req.user.id,
      start_time: now,
      date_today
    });
    res.json({ message: "Arbeitsbeginn erfasst", sessionId: session._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Arbeitsende
router.post("/stop", auth(), async (req, res) => {
  try {
    const now = new Date();
    const date_today = now.toISOString().split("T")[0];
    const session = await WorkSession.findOneAndUpdate(
      { user_id: req.user.id, date_today, end_time: null },
      { end_time: now },
      { sort: { start_time: -1 }, new: true }
    );
    if (!session) return res.status(404).json({ error: "Keine offene Session gefunden" });
    res.json({ message: "Arbeitsende erfasst", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Manuelle Arbeitszeit erfassen
router.post("/manual-time", auth(), async (req, res) => {
  try {
    const { date, start, end } = req.body;
    if (!date || !start || !end) return res.status(400).json({ error: "Alle Felder erforderlich" });

    const startDT = new Date(`${date}T${start}:00`);
    const endDT = new Date(`${date}T${end}:00`);

    const session = await WorkSession.create({
      user_id: req.user.id,
      start_time: startDT,
      end_time: endDT,
      date_today: date
    });

    res.json({ message: "Arbeitszeit manuell eingetragen", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Alle Arbeitszeiten abrufen
router.get("/", auth(), async (req, res) => {
  try {
    const { startDate, endDate, employeeName, department } = req.query;
    const query = {};
    if (req.user.role !== "admin") query.user_id = req.user.id;

    if (startDate || endDate) query.start_time = {};
    if (startDate) query.start_time.$gte = new Date(startDate);
    if (endDate) query.start_time.$lte = new Date(endDate);

    let sessionsQuery = WorkSession.find(query)
      .sort({ start_time: -1 })
      .populate("user_id", "name role department");

    if (req.user.role === "admin") {
      if (employeeName) sessionsQuery = sessionsQuery.where("user_id.name").regex(new RegExp(employeeName, "i"));
      if (department) sessionsQuery = sessionsQuery.where("user_id.department").regex(new RegExp(department, "i"));
    }

    const sessions = await sessionsQuery.exec();

    res.json(
      sessions
        .filter(s => s.user_id)
        .map(s => ({
          id: s._id,
          user_id: s.user_id._id,
          name: s.user_id.name,
          department: s.user_id.department,
          start_time: s.start_time.toISOString(),
          end_time: s.end_time ? s.end_time.toISOString() : null,
          date_today: s.date_today
        }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Arbeitszeiten" });
  }
});

// 🟢 Dashboard Summary
router.get("/summary", auth(), async (req, res) => {
  try {
    const filter = req.user.role !== "admin" ? { user_id: req.user.id } : {};
    const lastStart = await WorkSession.find(filter).sort({ start_time: -1 }).limit(1);
    const lastEnd = await WorkSession.find(filter).sort({ end_time: -1 }).limit(1);
    const totalEntries = await WorkSession.countDocuments(filter);

    res.json({
      lastStart: lastStart[0]?.start_time ? lastStart[0].start_time.toISOString() : null,
      lastEnd: lastEnd[0]?.end_time ? lastEnd[0].end_time.toISOString() : null,
      totalEntries
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Summary" });
  }
});

export default router;

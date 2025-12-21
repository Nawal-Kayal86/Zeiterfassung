// routes/workSessions.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import WorkSession from '../models/WorkSession.js';
import User from '../models/User.js';

const router = express.Router();

// 🟢 Arbeitsbeginn
router.post("/start", auth(), async (req, res) => {
  try {
    const date_today = new Date().toISOString().split("T")[0];
    const session = await WorkSession.create({
      user_id: req.user.id,
      start_time: new Date(),
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
    const date_today = new Date().toISOString().split("T")[0];
    const session = await WorkSession.findOneAndUpdate(
      { user_id: req.user.id, date_today, end_time: null },
      { end_time: new Date() },
      { sort: { start_time: -1 }, new: true }
    );
    if (!session) return res.status(404).json({ error: "Keine offene Session gefunden" });
    res.json({ message: "Arbeitsende erfasst", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/manual-time", auth(), async (req, res) => {
  try {
    const { date, start, end } = req.body;
    if (!date || (!start && !end)) 
      return res.status(400).json({ error: "Datum und mindestens Start oder Ende erforderlich" });

    const openSession = await WorkSession.findOne({ user_id: req.user.id, end_time: null });

    // Nur Ende setzen, offene Session schließen
    if (!start && end) {
      if (!openSession) return res.status(400).json({ error: "Keine offene Startzeit vorhanden" });
      openSession.end_time = new Date(`${date}T${end}:00+02:00`);
      await openSession.save();
      return res.json({ message: "Offene Arbeitszeit beendet ✅", session: openSession });
    }

    // Start eintragen, aber nur wenn keine offene Session existiert
    if (start && !end) {
      if (openSession) return res.status(400).json({ error: "Es gibt bereits eine offene Startzeit" });
      const session = await WorkSession.create({
        user_id: req.user.id,
        start_time: new Date(`${date}T${start}:00+02:00`),
        date_today: date
      });
      return res.json({ message: "Arbeitsbeginn manuell erfasst ✅", session });
    }

    // Start + Ende gleichzeitig, nur wenn keine offene Session
    if (start && end) {
      if (openSession) return res.status(400).json({ error: "Offene Startzeit existiert, Start+Ende nicht erlaubt" });
      const session = await WorkSession.create({
        user_id: req.user.id,
        start_time: new Date(`${date}T${start}:00+02:00`),
        end_time: new Date(`${date}T${end}:00+02:00`),
        date_today: date
      });
      return res.json({ message: "Arbeitszeit manuell erfasst ✅", session });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// 🟢 Alle Arbeitszeiten abrufen (mit Filter)
router.get("/", auth(), async (req, res) => {
  try {
    const { startDate, endDate, employeeName, department } = req.query;
    const query = {};

    if (req.user.role !== "admin") query.user_id = req.user.id;

    if (startDate) query.date_today = { ...query.date_today, $gte: startDate };
    if (endDate) query.date_today = { ...query.date_today, $lte: endDate };

    let sessionsQuery = WorkSession.find(query).sort({ date_today: -1, start_time: -1 }).populate("user_id", "name role department");

    if (req.user.role === "admin") {
      if (employeeName) sessionsQuery = sessionsQuery.where("user_id.name").regex(new RegExp(employeeName, "i"));
      if (department) sessionsQuery = sessionsQuery.where("user_id.department").regex(new RegExp(department, "i"));
    }

    const sessions = await sessionsQuery.exec();

    res.json(sessions.map(s => ({
      id: s._id,
      user_id: s.user_id._id,
      name: s.user_id.name,
      department: s.user_id.department,
      start_time: s.start_time,
      end_time: s.end_time,
      date_today: s.date_today
    })));
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
      lastStart: lastStart[0]?.start_time,
      lastEnd: lastEnd[0]?.end_time,
      totalEntries
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Summary" });
  }
});

export default router;

// routes/workSessions.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import WorkSession from '../models/WorkSession.js';
import User from '../models/User.js';

const router = express.Router();

// 🟢 Arbeitsbeginn
router.post("/start", auth(), async (req, res) => {
  try {
<<<<<<< HEAD
    const date_today = new Date().toISOString().split("T")[0];
  const start = new Date();

const session = new WorkSession({
  user_id: req.user.id,
  start_time: start,
  end_time: null,
  date_today
});

await session.save();


=======
    const now = new Date();
    const date_today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const session = await WorkSession.create({
      user_id: req.user.id,
      start_time: now,
      date_today
    });
>>>>>>> 13d1e08ccbda6ef44a5cc3db97539d9511538d7c
    res.json({ message: "Arbeitsbeginn erfasst", sessionId: session._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Arbeitsende
// 🟢 Arbeitsende (FIXED)
router.post("/stop", auth(), async (req, res) => {
  try {
<<<<<<< HEAD
    const end = new Date();

    const session = await WorkSession.findOneAndUpdate(
      {
        user_id: req.user.id,
        end_time: null
      },
      {
        end_time: end
      },
      {
        sort: { start_time: -1 },
        new: true
      }
=======
    const now = new Date();
    const date_today = now.toISOString().split("T")[0];
    const session = await WorkSession.findOneAndUpdate(
      { user_id: req.user.id, date_today, end_time: null },
      { end_time: now },
      { sort: { start_time: -1 }, new: true }
>>>>>>> 13d1e08ccbda6ef44a5cc3db97539d9511538d7c
    );

    if (!session) {
      return res.status(404).json({ error: "Keine offene Session gefunden" });
    }

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
    const query = {};
<<<<<<< HEAD

    if (req.user.role !== "admin") {
      query.user_id = req.user.id;
=======
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
>>>>>>> 13d1e08ccbda6ef44a5cc3db97539d9511538d7c
    }

    const sessions = await WorkSession
      .find(query)
      .sort({ start_time: -1 }) // ⭐ الترتيب الصحيح
      .populate("user_id");

    res.json(
      sessions.map(s => ({
        id: s._id,
        name: s.user_id ? s.user_id.name : "-",
        department: s.user_id ? s.user_id.department : "-",
        date_today: s.date_today,
        start_time: s.start_time
          ? s.start_time.toISOString().substring(11, 16)
          : null,
        end_time: s.end_time
          ? s.end_time.toISOString().substring(11, 16)
          : null
      }))
    );

<<<<<<< HEAD
=======
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
>>>>>>> 13d1e08ccbda6ef44a5cc3db97539d9511538d7c
  } catch (err) {
    console.error("❌ workSessions error:", err);
    res.status(500).json({ error: err.message });
  }
});



// 🟢 Dashboard Summary
router.get("/summary", auth(), async (req, res) => {
  try {
<<<<<<< HEAD
    const query = req.user.role === "admin"
      ? {}
      : { user_id: req.user.id };

    const sessions = await WorkSession.find(query).sort({ start_time: -1 });

    const last = sessions[0];

    res.json({
      lastStart: last?.start_time || null,
      lastEnd: last?.end_time || null,
      totalEntries: sessions.length
=======
    const filter = req.user.role !== "admin" ? { user_id: req.user.id } : {};
    const lastStart = await WorkSession.find(filter).sort({ start_time: -1 }).limit(1);
    const lastEnd = await WorkSession.find(filter).sort({ end_time: -1 }).limit(1);
    const totalEntries = await WorkSession.countDocuments(filter);

    res.json({
      lastStart: lastStart[0]?.start_time ? lastStart[0].start_time.toISOString() : null,
      lastEnd: lastEnd[0]?.end_time ? lastEnd[0].end_time.toISOString() : null,
      totalEntries
>>>>>>> 13d1e08ccbda6ef44a5cc3db97539d9511538d7c
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summary Fehler" });
  }
});


export default router;

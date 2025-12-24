// routes/workSessions.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import WorkSession from '../models/WorkSession.js';
import User from '../models/User.js';
const router = express.Router();

// 🟢 Arbeitsbeginn
router.post("/start", auth(), async (req, res) => {
  try {
    const openSession = await WorkSession.findOne({
      user_id: req.user.id,
      end_time: null
    });

    if (openSession) {
      return res.status(400).json({
        error: "Es existiert bereits eine offene Arbeitszeit"
      });
    }

    const date_today = new Date().toISOString().split("T")[0];

    const session = await WorkSession.create({
      user_id: req.user.id,
      start_time: new Date(),
      date_today
    });

    res.json({
      message: "Arbeitsbeginn erfasst ✅",
      session
    });
  } catch (err) {
    ////console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// 🟢 Arbeitsende
router.post("/stop", auth(), async (req, res) => {
  try {
    const openSession = await WorkSession.findOne({
      user_id: req.user.id,
      end_time: null
    });

    if (!openSession) {
      return res.status(400).json({
        error: "Keine offene Arbeitszeit vorhanden"
      });
    }

    const endTime = new Date();

    if (endTime <= openSession.start_time) {
      return res.status(400).json({
        error: "Endzeit muss nach Startzeit liegen"
      });
    }

    openSession.end_time = endTime;
    await openSession.save();

    res.json({
      message: "Arbeitsende erfasst ✅",
      session: openSession
    });
  } catch (err) {
    //console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Manuelle Zeiterfassung
router.post("/manual-time", auth(), async (req, res) => {
  try {
    const { date, start, end } = req.body;

    if (!date || (!start && !end)) {
      return res
        .status(400)
        .json({ error: "Datum und mindestens Start oder Ende erforderlich" });
    }

    const startDT = start
      ? new Date(`${date}T${start}:00+02:00`)
      : null;

    const endDT = end
      ? new Date(`${date}T${end}:00+02:00`)
      : null;

    const openSession = await WorkSession.findOne({
      user_id: req.user.id,
      end_time: null
    });

    // 🔴 NUR ENDE → offene Session beenden
    if (!start && end) {
      if (!openSession)
        return res.status(400).json({ error: "Keine offene Startzeit vorhanden" });

      if (endDT <= openSession.start_time)
        return res.status(400).json({ error: "Endzeit muss nach Startzeit liegen" });

      openSession.end_time = endDT;
      await openSession.save();

      return res.json({
        message: "Offene Arbeitszeit beendet ✅",
        session: openSession
      });
    }

    // 🟢 NUR START → nur wenn keine offene Session
    if (start && !end) {
      if (openSession)
        return res.status(400).json({ error: "Es gibt bereits eine offene Startzeit" });

      const session = await WorkSession.create({
        user_id: req.user.id,
        start_time: startDT,
        date_today: date
      });

      return res.json({
        message: "Arbeitsbeginn manuell erfasst ✅",
        session
      });
    }

    // 🟢 START + ENDE → nur wenn keine offene Session
    if (start && end) {
      if (openSession)
        return res.status(400).json({ error: "Offene Startzeit existiert" });

      if (endDT <= startDT)
        return res.status(400).json({ error: "Endzeit muss nach Startzeit liegen" });

      const session = await WorkSession.create({
        user_id: req.user.id,
        start_time: startDT,
        end_time: endDT,
        date_today: date
      });

      return res.json({
        message: "Arbeitszeit manuell erfasst ✅",
        session
      });
    }

  } catch (err) {
    //console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// 🟢 Alle Arbeitszeiten abrufen (FINAL)
router.get("/", auth(), async (req, res) => {
  try {
    const query = req.user.role === "admin"
      ? {}
      : { user_id: req.user.id };

    const sessions = await WorkSession
      .find(query)
      .sort({ start_time: -1 })
      .populate("user_id", "name department");

    const result = sessions.map(s => {
      const start = s.start_time ? new Date(s.start_time) : null;
      const end = s.end_time ? new Date(s.end_time) : null;

      let duration = "-";
      if (start && end && end > start) {
        const diffMin = Math.floor((end - start) / 60000);
        const h = String(Math.floor(diffMin / 60)).padStart(2, "0");
        const m = String(diffMin % 60).padStart(2, "0");
        duration = `${h}:${m}`;
      }

      return {
  id: s._id,
  name: s.user_id?.name || "-",
  department: s.user_id?.department || "-",

  start: start ? start.toISOString() : null,
  end: end ? end.toISOString() : null,
  date_today: s.date_today,
};
      });

    res.json(result);
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
    //console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Summary" });
  }
});

export default router;

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
    res.status(500).json({ error: "Datenbankfehler" });
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
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// 🟢 Manuelle Zeiterfassung
router.post("/manual-time", auth(), async (req, res) => {
  try {
    const { date, start, end, userId, pause } = req.body;

    // Admin darf userId setzen, User darf nur für sich selbst (req.user.id)
    const targetUserId = (req.user.role === 'admin' && userId) ? userId : req.user.id;

    if (!date || (!start && !end)) {
      return res
        .status(400)
        .json({ error: "Datum und mindestens Start oder Ende erforderlich" });
    }

    const parseDateTime = (dStr, tStr) => {
      if (!tStr) return null;
      const [y, m, d] = dStr.split("-").map(Number);
      const [hh, mm] = tStr.split(":").map(Number);
      return new Date(y, m - 1, d, hh, mm);
    };

    const startDT = parseDateTime(date, start);
    const endDT = parseDateTime(date, end);

    const openSession = await WorkSession.findOne({
      user_id: targetUserId,
      end_time: null
    });

    // 🔴 NUR ENDE → offene Session beenden
    if (!start && end) {
      if (!openSession)
        return res.status(400).json({ error: "Keine offene Startzeit vorhanden" });

      if (endDT <= openSession.start_time)
        return res.status(400).json({ error: "Endzeit muss nach Startzeit liegen" });

      openSession.end_time = endDT;
      if (pause) openSession.pause = pause;
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
        user_id: targetUserId,
        start_time: startDT,
        date_today: date,
        pause: pause || "0:00"
      });

      return res.json({
        message: "Arbeitsbeginn manuell erfasst ✅",
        session
      });
    }

    // 🟢 START + ENDE
    if (start && end) {
      if (endDT <= startDT)
        return res.status(400).json({ error: "Endzeit muss nach Startzeit liegen" });

      // Prüfen, ob für diesen Tag bereits ein Eintrag existiert
      const existingSession = await WorkSession.findOne({
        user_id: targetUserId,
        date_today: date
      });

      if (existingSession) {
        existingSession.start_time = startDT;
        existingSession.end_time = endDT;
        existingSession.pause = pause || existingSession.pause || "0:00";
        await existingSession.save();
        return res.json({
          message: "Arbeitszeit für diesen Tag aktualisiert ✅",
          session: existingSession
        });
      }

      const session = await WorkSession.create({
        user_id: targetUserId,
        start_time: startDT,
        end_time: endDT,
        date_today: date,
        pause: pause || "0:00"
      });

      return res.json({
        message: "Arbeitszeit manuell erfasst ✅",
        session
      });
    }

  } catch (err) {
    //console.error(err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});


// 🟢 Alle Arbeitszeiten abrufen (FILTERBAR)
router.get("/", auth(), async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const query = {};

    // Rollen-Check: Wenn kein Admin, nur eigene Daten
    if (req.user.role !== "admin") {
      query.user_id = req.user.id;
    } else if (userId) {
      query.user_id = userId;
    }

    // Datums-Filter
    if (startDate || endDate) {
      query.start_time = {};
      if (startDate) query.start_time.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.start_time.$lte = end;
      }
    }

    const sessions = await WorkSession
      .find(query)
      .sort({ start_time: -1 })
      .populate("user_id", "name department");

    const result = sessions.map(s => {
      const start = s.start_time ? new Date(s.start_time) : null;
      const end = s.end_time ? new Date(s.end_time) : null;

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

// 🟢 Arbeitszeit löschen
router.delete("/:id", auth(), async (req, res) => {
  try {
    const session = await WorkSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Sitzung nicht gefunden" });

    // Nur Admin oder der Besitzer darf löschen
    if (req.user.role !== "admin" && session.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Keine Berechtigung" });
    }

    await session.deleteOne();
    res.json({ message: "Arbeitszeit gelöscht ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});

// 🟢 Arbeitszeit bearbeiten
router.put("/:id", auth(), async (req, res) => {
  try {
    const { start, end } = req.body;
    const session = await WorkSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Sitzung nicht gefunden" });

    // Nur Admin oder der Besitzer darf bearbeiten
    if (req.user.role !== "admin" && session.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Keine Berechtigung" });
    }

    if (start) session.start_time = new Date(start);
    if (end) session.end_time = new Date(end);

    // Check if end is before start
    if (session.end_time && session.start_time && session.end_time <= session.start_time) {
      return res.status(400).json({ error: "Endzeit muss nach der Startzeit liegen" });
    }

    await session.save();
    res.json({ message: "Arbeitszeit aktualisiert ✅", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Aktualisieren" });
  }
});

export default router;

// routes/workSessions.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { initDB } from '../db.js';

const router = express.Router();
const pool = await initDB();

// 🟢 Arbeitsbeginn
router.post("/start", auth(), async (req, res) => {
  try {
    const now = new Date();
    const date_today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    await pool.query(
      "INSERT INTO work_sessions (user_id, start_time, date_today) VALUES (?, NOW(), ?)",
      [req.user.id, date_today]
    );
    res.json({ message: "Arbeitsbeginn erfasst" });
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

    const [result] = await pool.query(
      `UPDATE work_sessions
       SET end_time = NOW()
       WHERE user_id = ? AND date_today = ? AND end_time IS NULL
       ORDER BY start_time DESC
       LIMIT 1`,
      [req.user.id, date_today]
    );

    res.json({ message: "Arbeitsende erfasst", affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Manuelle Arbeitszeit erfassen
router.post("/manual-time", auth(), async (req, res) => {
  const { date, start, end } = req.body;
  if (!date || !start || !end) return res.status(400).json({ error: "Alle Felder erforderlich" });

  try {
    // Datum + Uhrzeit in Wien (lokal) -> UTC
    const startDT = new Date(`${date}T${start}:00+02:00`);
    const endDT = new Date(`${date}T${end}:00+02:00`);

    await pool.query(
      "INSERT INTO work_sessions (user_id, start_time, end_time, date_today) VALUES (?, ?, ?, ?)",
      [req.user.id, startDT, endDT, date]
    );

    res.json({ message: "Arbeitszeit manuell eingetragen" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Alle Arbeitszeiten mit Filtern (Dashboard)
router.get("/", auth(), async (req, res) => {
  try {
    const { startDate, endDate, employeeName, department } = req.query;
    const { id: userId, role } = req.user;

    let query = `
      SELECT
        ws.id,
        u.id AS user_id,
        u.name,
        u.department,
        ws.start_time,
        ws.end_time,
        ws.date_today
      FROM work_sessions ws
      INNER JOIN users u ON u.id = ws.user_id
      WHERE 1 = 1
    `;
    const params = [];

    // 👤 Nur eigene Daten für normale User
    if (role !== "admin") {
      query += " AND u.id = ?";
      params.push(userId);
    }

    // 📅 Datum
    if (startDate) {
      query += " AND ws.date_today >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND ws.date_today <= ?";
      params.push(endDate);
    }

    // 👤 Nur Admin darf diese Filter
    if (role === "admin" && employeeName) {
      query += " AND u.name LIKE ?";
      params.push(`%${employeeName}%`);
    }
    if (role === "admin" && department) {
      query += " AND u.department LIKE ?";
      params.push(`%${department}%`);
    }

    query += " ORDER BY ws.date_today DESC, ws.start_time DESC";

    const [rows] = await pool.query(query, params);

    // 🕒 Formatierung
    const formattedRows = rows.map(r => ({
      ...r,
      start_time: r.start_time ? new Date(r.start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Vienna" }) : "",
      end_time: r.end_time ? new Date(r.end_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Vienna" }) : "",
      date_today: r.date_today ? new Date(r.date_today).toISOString().split("T")[0] : null
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error("❌ Fehler bei GET /api/work-sessions:", err);
    res.status(500).json({ error: "Fehler beim Laden der Arbeitszeiten" });
  }
});

// 🟢 Dashboard Summary (letzter Start, letztes Ende, Gesamtanzahl)
router.get("/summary", auth(), async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const params = [];
    let userFilter = "";

    if (role !== "admin") {
      userFilter = " AND ws.user_id = ?";
      params.push(userId);
    }

    // Letzter Start
    const [lastStartRows] = await pool.query(
      `SELECT start_time FROM work_sessions ws
       WHERE ws.start_time IS NOT NULL ${userFilter}
       ORDER BY ws.start_time DESC LIMIT 1`,
      params
    );

    // Letztes Ende
    const [lastEndRows] = await pool.query(
      `SELECT end_time FROM work_sessions ws
       WHERE ws.end_time IS NOT NULL ${userFilter}
       ORDER BY ws.end_time DESC LIMIT 1`,
      params
    );

    // Gesamtanzahl Einträge
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM work_sessions ws
       WHERE ws.start_time IS NOT NULL ${userFilter}`,
      params
    );

  const toVienna = (utcStr) => {
  if (!utcStr) return null;
  const d = new Date(utcStr + "Z"); // UTC
  if (isNaN(d)) return null;
  // ISO-String für Frontend
  return d.toISOString(); 
};

    res.json({
      lastStart: toVienna(lastStartRows[0]?.start_time),
      lastEnd: toVienna(lastEndRows[0]?.end_time),
      totalEntries: countRows[0]?.total ?? 0,
    });
  } catch (err) {
    console.error("❌ Fehler bei GET /api/work-sessions/summary:", err);
    res.status(500).json({ error: "Fehler beim Laden der Summary" });
  }
});

export default router;

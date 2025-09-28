import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initDB } from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = await initDB();

// 🔑 Middleware: Authentifizierung prüfen
function auth(requiredRole = null) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token" });
    const token = header.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

// 🟢 Registrierung (nur Demo)
app.post("/api/register", async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password) return res.status(400).json({ error: "Missing data" });

  const hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, role, password_hash) VALUES (?, ?, ?)",
      [name, role || "employee", hash]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Login
app.post("/api/login", async (req, res) => {
  const { name, password } = req.body;

  const [rows] = await pool.query("SELECT * FROM users WHERE name = ?", [name]);
  if (!rows.length) return res.status(401).json({ error: "Login fehlgeschlagen" });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );

  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// 🟢 Geschützte Route → aktuelle Userdaten
app.get("/api/me", auth(), async (req, res) => {
  res.json({ user: req.user });
});

// 🟢 Arbeitsbeginn
app.post("/api/start", auth(), async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO work_sessions (user_id, start_time) VALUES (?, NOW())",
      [req.user.id]
    );
    res.json({ message: "Arbeitsbeginn erfasst" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Arbeitsende
app.post("/api/stop", auth(), async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE work_sessions SET end_time = NOW() WHERE user_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1",
      [req.user.id]
    );
    res.json({ message: "Arbeitsende erfasst", affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Admin: alle User + deren Arbeitszeiten
app.get("/api/admin/users", auth("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id AS user_id, u.name, u.role,
             ws.start_time, ws.end_time
      FROM users u
      LEFT JOIN work_sessions ws ON ws.user_id = u.id
      ORDER BY u.name ASC, ws.start_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Manuelle Arbeitszeit erfassen
app.post("/api/manual-time", auth(), async (req, res) => {
  const { date, start, end } = req.body;
  if (!date || !start || !end) {
    return res.status(400).json({ error: "Alle Felder sind erforderlich" });
  }

  try {
    const startDateTime = `${date} ${start}:00`;
    const endDateTime = `${date} ${end}:00`;

   await pool.query(
  "INSERT INTO work_sessions (user_id, start_time, end_time, date_today) VALUES (?, ?, ?, ?)",
  [req.user.id, startDateTime, endDateTime, date]
);

    res.json({ message: "Arbeitszeit manuell eingetragen" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Alle Arbeitszeiten mit Filtern (Dashboard-Tabelle)
app.get("/api/work-sessions", auth(), async (req, res) => {
  try {
    const { startDate, endDate, employeeName, department } = req.query;

  let query = `
  SELECT
    ws.id,
    u.id AS user_id,
    u.name AS name,          -- 🟢 Alias hinzufügen!
    u.department,
    ws.start_time,
    ws.end_time,
    ws.date_today
  FROM work_sessions ws
  INNER JOIN users u ON u.id = ws.user_id
  WHERE 1=1
`;



    const params = [];

    // 👤 Filter: Nur eigene Zeiten, wenn kein Admin
    if (req.user.role !== "admin") {
      query += " AND u.id = ?";
      params.push(req.user.id);
    }

    // 📅 Filter: Datum
    if (startDate) {
      query += " AND ws.date_today >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND ws.date_today <= ?";
      params.push(endDate);
    }

    // 🏷 Filter: Name
    if (employeeName) {
      query += " AND LOWER(u.name) LIKE ?";
      params.push(`%${employeeName.toLowerCase()}%`);
    }

    // 🏢 Filter: Abteilung
    if (department) {
      query += " AND LOWER(u.department) = ?";
      params.push(department.toLowerCase());
    }

    query += " ORDER BY ws.date_today DESC, ws.start_time DESC";

    const [rows] = await pool.query(query, params);

    const formattedRows = rows.map(r => ({
      ...r,
     date_today: r.date_today
  ? `${r.date_today.getFullYear()}-${String(r.date_today.getMonth()+1).padStart(2,'0')}-${String(r.date_today.getDate()).padStart(2,'0')}`
  : null
      ,
      start_time: r.start_time ? r.start_time.toString().slice(0, 8) : null,
      end_time: r.end_time ? r.end_time.toString().slice(0, 8) : null,
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error("Fehler bei /api/work-sessions:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Usernamen-Liste (für Dropdowns o.Ä.)
app.get("/api/users/names", async (req, res) => {
  try {
    const [usernames] = await pool.query("SELECT name FROM users");
    res.json(usernames.map(u => u.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🟢 Neuen User anlegen
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, role, nfc_tag, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, Email und Passwort sind erforderlich" });
    }

    const allowedRoles = ["user", "admin"];
    const safeRole = allowedRoles.includes(role) ? role : "user";
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, role, nfc_tag, password_hash) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, safeRole, nfc_tag || null, password_hash]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role: safeRole,
      nfc_tag
    });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "E-Mail oder NFC-Tag bereits vergeben" });
    } else {
      res.status(500).json({ error: "Fehler beim Anlegen" });
    }
  }
});

// 🟢 Userliste (Admin-Übersicht)
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, nfc_tag, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der User" });
  }
});

// 🟢 Dashboard: letzte Start- und Endzeit + Anzahl der Einträge
app.get("/api/work-sessions/summary", auth(), async (req, res) => {
  try {
    let userFilter = "";
    const params = [];

    if (req.user.role !== "admin") {
      userFilter = " AND ws.user_id = ?";
      params.push(req.user.id);
    }

    const [lastStart] = await pool.query(
      `SELECT start_time, date_today 
       FROM work_sessions ws
       WHERE 1=1
       ${userFilter}
       ORDER BY date_today DESC, start_time DESC
       LIMIT 1`,
      params
    );

    const [lastEnd] = await pool.query(
      `SELECT end_time, date_today
       FROM work_sessions ws
       WHERE 1=1
       ${userFilter}
       AND end_time IS NOT NULL
       ORDER BY date_today DESC, end_time DESC
       LIMIT 1`,
      params
    );

    const [count] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM work_sessions ws
       WHERE 1=1
       ${userFilter}`,
      params
    );

    res.json({
      lastStart: lastStart.length
        ? {
            start_time: lastStart[0].start_time?.toString().slice(0, 8) || null,
            date_today: lastStart[0].date_today?.toISOString().split("T")[0] || null,
          }
        : null,
      lastEnd: lastEnd.length
        ? {
            end_time: lastEnd[0].end_time?.toString().slice(0, 8) || null,
            date_today: lastEnd[0].date_today?.toISOString().split("T")[0] || null,
          }
        : null,
      totalEntries: count[0].total,
    });
  } catch (err) {
    console.error("Fehler bei /api/work-sessions/summary:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// Anwesenheitsübersicht (nur eigene Daten für User)
app.get("/api/attendance", async (req, res) => {
  try {
    // JWT Token prüfen
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: "Nicht eingeloggt" })

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    let sql = `
      SELECT ws.id, u.name, u.role, u.department,
             DATE_FORMAT(ws.start_time, '%Y-%m-%dT%H:%i:%s') as start_time,
             DATE_FORMAT(ws.end_time, '%Y-%m-%dT%H:%i:%s') as end_time
      FROM work_sessions ws
      JOIN users u ON ws.user_id = u.id
    `
    let params = []

    // Wenn kein Admin → nur eigene Daten
    if (decoded.role !== "admin") {
      sql += " WHERE u.id = ?"
      params.push(decoded.id)
    }

    sql += " ORDER BY ws.start_time DESC"

    const [rows] = await pool.execute(sql, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Fehler beim Laden der Anwesenheitsdaten" })
  }
})

// Fehlerprotokoll (Beispiel-Daten)
app.get("/api/errors", async (req, res) => {
  try {
    // Beispiel falls du eine DB-Tabelle "error_logs" hast:
    // const [rows] = await pool.execute("SELECT * FROM error_logs ORDER BY created_at DESC")

    // Testdaten solange keine Tabelle existiert
    const rows = [
      { id: 1, message: "Login fehlgeschlagen", level: "WARN", created_at: "2025-09-25 14:20:00" },
      { id: 2, message: "DB Verbindung verloren", level: "ERROR", created_at: "2025-09-26 08:45:00" },
      { id: 3, message: "Ungültige Eingabe im Formular", level: "INFO", created_at: "2025-09-26 10:10:00" }
    ];

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Logs" });
  }
});

// --- Terminal Logs ---
// Terminal-Logs abrufen
app.get("/api/logs", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, message, level, created_at
      FROM logs
      ORDER BY created_at DESC
      LIMIT 50
    `)
    res.json(rows)
  } catch (err) {
    console.error("Fehler beim Abrufen der Logs:", err)
    res.status(500).json({ error: "Fehler beim Laden der Logs" })
  }
})




// --- Dummy-APIs (optional, später mit echten Daten ersetzen) ---
app.get("/api/workflow", (req, res) => {
  res.json([
    { id: 1, task: "Check-In um 08:00", status: "done" },
    { id: 2, task: "Meeting mit IT", status: "open" }
  ])
})

app.get("/api/schedule", (req, res) => {
  res.json([
    { id: 1, name: "Ali", department: "IT", date: "2025-09-28", shift: "Frühschicht" },
    { id: 2, name: "Eva", department: "Einkauf", date: "2025-09-28", shift: "Spätschicht" }
  ])
})

app.get("/api/reports", (req, res) => {
  res.json({
    users: 20,
    total_hours: 340,
    departments: { IT: 10, HR: 5, Einkauf: 5 }
  })
})




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend läuft auf http://localhost:" + PORT));

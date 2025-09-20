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

// Middleware: Auth prüfen
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



// Registrierung (nur Demo, in echt nur Admin sollte neue User anlegen)
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

// Login
app.post("/api/login", async (req, res) => {
  const { name, password } = req.body;

  // 1. User aus DB holen
  const [rows] = await pool.query("SELECT * FROM users WHERE name = ?", [name]);
  if (!rows.length) return res.status(401).json({ error: "Login fehlgeschlagen" });

  const user = rows[0];  // <-- unbedingt VOR jwt.sign

  // 2. Passwort prüfen
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Wrong password" });

  // 3. JWT erzeugen
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" } // Session = 15 Minuten
  );

  // 4. Antwort zurück
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});


// Geschützte Route: nur eingeloggte User
app.get("/api/me", auth(), async (req, res) => {
  res.json({ user: req.user });
});

// Arbeitsbeginn (geschützt)
app.post("/api/start", auth(), async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO work_sessions (user_id, start_time, date_today) VALUES (?, NOW(), CURDATE())",
      [req.user.id]
    );
    res.json({ message: "Arbeitsbeginn erfasst" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Arbeitsende (geschützt)
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

// Admin: alle Arbeitszeiten aller User
app.get("/api/admin/users", auth("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id AS user_id, u.name, u.role,
             ws.start_time, ws.end_time
      FROM users u
      LEFT JOIN work_sessions ws ON ws.user_id = u.id
      ORDER BY u.name ASC, ws.start_time DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "DB error" })
  }
})


// Manuelle Arbeitszeit (geschützt, nur eingeloggte User)
app.post("/api/manual-time", auth(), async (req, res) => {
  const { date, start, end } = req.body;

  if (!date || !start || !end) {
    return res.status(400).json({ error: "Alle Felder sind erforderlich" });
  }

  try {
    // Kombiniere Datum + Zeit zu MySQL DATETIME
    const startDateTime = `${date} ${start}:00`;
    const endDateTime = `${date} ${end}:00`;

    await pool.query(
      "INSERT INTO work_sessions (user_id, start_time, end_time) VALUES (?, ?, ?)",
      [req.user.id, startDateTime, endDateTime]
    );

    res.json({ message: "Arbeitszeit manuell eingetragen" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// Alle Arbeitszeiten mit optionalen Filtern
app.get("/api/work-sessions", auth(), async (req, res) => {
  try {
    // Query-Parameter auslesen
    const { startDate, endDate, employeeName, department } = req.query;

    let query = `
      SELECT ws.id, u.id AS user_id, u.name, u.department,
             ws.start_time, ws.end_time, ws.date_today
      FROM work_sessions ws
      INNER JOIN users u ON u.id = ws.user_id
      WHERE 1=1
    `;
    const params = [];

    // Filter: nur eigene Daten, wenn kein Admin
    if (req.user.role !== 'admin') {
      query += ` AND u.id = ?`;
      params.push(req.user.id);
    }

    // Filter: Datum
    if (startDate) {
      query += ` AND ws.date_today >= ?`;
      params.push(startDate);
      console.log(startDate);
    }
    if (endDate) {
      query += ` AND ws.date_today <= ?`;
      params.push(endDate);
      console.log(endDate);
    }

    // Filter: Mitarbeiter
    if (employeeName) {
      query += ` AND u.name LIKE ?`;
      params.push(`%${employeeName}%`);
    }

    // Filter: Abteilung
    if (department) {
      query += ` AND u.department = ?`;
      params.push(department);
    }

    query += ` ORDER BY ws.date_today DESC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.get("/api/users/names", async (req, res) => {
  try {
    const [usernames] = await pool.query("SELECT name FROM users");
    res.json(usernames.map(u => u.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/users", async (req, res) => {
 try {
    const { name, email, role, nfc_tag, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, Email und Passwort sind erforderlich" })
    }

    // Rolle prüfen
    const allowedRoles = ["employee", "admin"]
    const safeRole = allowedRoles.includes(role) ? role : "employee"

    // Passwort hashen
    const password_hash = await bcrypt.hash(password, 10)

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, role, nfc_tag, password_hash) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, safeRole, nfc_tag || null, password_hash]
    )

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role: safeRole,
      nfc_tag
    })
  } catch (err) {
    console.error(err)
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "E-Mail oder NFC-Tag bereits vergeben" })
    } else {
      res.status(500).json({ error: "Fehler beim Anlegen" })
    }
  }
})

app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, nfc_tag, created_at FROM users ORDER BY created_at DESC"
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Fehler beim Laden der User" })
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend läuft auf http://localhost:" + PORT));

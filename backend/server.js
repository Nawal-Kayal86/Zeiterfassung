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
  if (!rows.length) return res.status(401).json({ error: "User not found" });

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
      "INSERT INTO work_sessions (user_id, start_time) VALUES (?, NOW())",
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

// Admin-Route: Liste aller User + letzte Zeiten
app.get("/api/admin/users", auth("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.role,
        (SELECT start_time FROM work_sessions ws WHERE ws.user_id = u.id ORDER BY ws.start_time DESC LIMIT 1) AS last_start,
        (SELECT end_time FROM work_sessions ws WHERE ws.user_id = u.id ORDER BY ws.start_time DESC LIMIT 1) AS last_end
      FROM users u
      ORDER BY u.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend läuft auf http://localhost:" + PORT));

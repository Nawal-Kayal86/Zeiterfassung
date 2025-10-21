import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initDB } from './db.js';
import { auth } from "./middleware/auth.js";
import usersRouter from './routes/users.js';
import departmentsRouter from "./routes/departments.js";
import workSessionsRouter from './routes/workSessions.js';

dotenv.config();
const pool = await initDB();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/users", usersRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api", workSessionsRouter);


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

app.get('/api/reports', async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.execute('SELECT COUNT(*) AS userCount FROM users')
    const [[{ totalHours }]] = await pool.execute('SELECT SUM(TIMESTAMPDIFF(HOUR, start_time, end_time)) AS totalHours FROM work_sessions')
    const [byDepartment] = await pool.execute(`
      SELECT u.department, COUNT(DISTINCT u.id) AS count,
             SUM(TIMESTAMPDIFF(HOUR, ws.start_time, ws.end_time)) AS hours
      FROM users u
      LEFT JOIN work_sessions ws ON ws.user_id = u.id
      GROUP BY u.department
    `)
    res.json({ userCount, totalHours, departments: byDepartment.length, byDepartment })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Fehler beim Laden der Reports' })
  }
})

// ✅ Workflow – alle Tasks abrufen
app.get("/api/workflow", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM workflow ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Fehler beim Abrufen:", err);
    res.status(500).json({ error: "Fehler beim Laden der Workflow-Daten" });
  }
});

// ✅ Workflow – neuen Task hinzufügen
app.post("/api/workflow", async (req, res) => {
  try {
    const { task, status } = req.body;

    if (!task) {
      return res.status(400).json({ error: "Task-Name ist erforderlich" });
    }

    const [result] = await pool.execute(
      "INSERT INTO workflow (task, status) VALUES (?, ?)",
      [task, status || "open"]
    );

    const [newTask] = await pool.execute("SELECT * FROM workflow WHERE id = ?", [result.insertId]);

    res.status(201).json(newTask[0]);
  } catch (err) {
    console.error("Fehler beim Hinzufügen:", err);
    res.status(500).json({ error: "Fehler beim Speichern des Tasks" });
  }
});
// ✅ Task als "done" markieren
app.put("/api/workflow/:id/done", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("UPDATE workflow SET status = 'done' WHERE id = ?", [id]);
    const [updated] = await pool.execute("SELECT * FROM workflow WHERE id = ?", [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Fehler beim Aktualisieren:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Tasks" });
  }
});

// ❌ Task löschen
app.delete("/api/workflow/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM workflow WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ error: "Fehler beim Löschen des Tasks" });
  }
});

// Alle Abteilungen
app.get("/api/departments", auth("admin"), async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT name FROM departments ORDER BY name ASC");
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// User Abteilung zuweisen/aktualisieren
app.put("/api/users/:id/department", auth("admin"), async (req, res) => {
  const { id } = req.params;
  const { department } = req.body;
  try {
    await pool.execute("UPDATE users SET department=? WHERE id=?", [department, id]);
    res.json({ message: "Abteilung aktualisiert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend läuft auf http://localhost:" + PORT));

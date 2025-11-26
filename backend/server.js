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
import workflowRouter from './routes/workflow.js';
import User from './models/User.js';
import WorkSession from './models/WorkSession.js';
import Department from './models/Department.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
await initDB(); // MongoDB verbinden

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API-Routen
app.use("/api/users", usersRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/workSessions", workSessionsRouter);
app.use("/api/workflow", workflowRouter);

// 🟢 Login
app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });
    if (!user) return res.status(401).json({ error: "Login fehlgeschlagen" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 🟢 Aktueller User
app.get("/api/me", auth(), (req, res) => {
  res.json({ user: req.user });
});

// 🟢 Admin: alle User + Sessions
app.get("/api/admin/users", auth("admin"), async (req, res) => {
  try {
    const list = await User.aggregate([
      {
        $lookup: {
          from: "worksessions",
          localField: "_id",
          foreignField: "user_id",
          as: "sessions"
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB Error" });
  }
});

// 🟢 Usernamen-Liste
app.get("/api/users/names", async (req, res) => {
  try {
    const users = await User.find({}, "name");
    res.json(users.map(u => u.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB Error" });
  }
});

// 🟢 Anwesenheit
app.get("/api/attendance", auth(), async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { user_id: req.user.id };
    const sessions = await WorkSession.find(query).populate("user_id", "name role department").sort({ start_time: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Anwesenheitsdaten" });
  }
});

// 🟢 Departments
app.get("/api/departments", auth("admin"), async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments.map(d => d.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB Error" });
  }
});

// 🟢 User Department aktualisieren
app.put("/api/users/:id/department", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;
    await User.findByIdAndUpdate(id, { department });
    res.json({ message: "Abteilung aktualisiert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB Error" });
  }
});

// 🟢 Dummy-Daten: Schedule
app.get("/api/schedule", (req, res) => {
  res.json([
    { id: 1, name: "Ali", department: "IT", date: "2025-09-28", shift: "Frühschicht" },
    { id: 2, name: "Eva", department: "Einkauf", date: "2025-09-28", shift: "Spätschicht" }
  ]);
});

// 🟢 Fehlerprotokoll (Testdaten)
app.get("/api/errors", (req, res) => {
  const rows = [
    { id: 1, message: "Login fehlgeschlagen", level: "WARN", created_at: "2025-09-25 14:20:00" },
    { id: 2, message: "DB Verbindung verloren", level: "ERROR", created_at: "2025-09-26 08:45:00" },
    { id: 3, message: "Ungültige Eingabe im Formular", level: "INFO", created_at: "2025-09-26 10:10:00" }
  ];
  res.json(rows);
});


// -------------- Vue Frontend serven -----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Alle nicht-API-Routen auf index.html umleiten (Vue Router)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend läuft auf http://localhost:${PORT}`));

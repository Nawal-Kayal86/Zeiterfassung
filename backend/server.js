import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initDB } from './db.js';
import { auth } from "./middleware/auth.js";
import path from 'path';
import { fileURLToPath } from 'url';

// Routers
import usersRouter from './routes/users.js';
import departmentsRouter from "./routes/departments.js";
import workSessionsRouter from './routes/workSessions.js';
import calendarRoutes from "./routes/calendar.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import leaveRequestsRoutes from "./routes/leaveRequests.js";
import logsRouter from "./routes/logs.js";

// Models (nur für Login/Auth benötigt hier direkter Zugriff, sonst via Router)
import User from './models/User.js';
import WorkSession from './models/WorkSession.js';
import Department from './models/Department.js';

dotenv.config();
await initDB(); // MongoDB verbinden

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- API Routers ---
app.use("/api/users", usersRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/workSessions", workSessionsRouter);
app.use("/api/calendar", calendarRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/leave-requests", leaveRequestsRoutes);
app.use("/api/logs", logsRouter);

// --- Auth Routes (bleiben vorerst hier oder könnten in auth.routes.js) ---

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
      { expiresIn: "1d" }
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

// --- Legacy / Spezielle Routes (sollten idealerweise in Router moved werden) ---

// 🟢 Admin: alle User + Sessions (Erweiterte User-Info)
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

// 🟢 Anwesenheit (Dashboard Übersicht)
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

// 🟢 Berichte / Statistiken
app.get("/api/reports", auth("admin"), async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const departmentsCount = await Department.countDocuments();

    const usersPerDept = await User.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const hoursPerDept = await WorkSession.aggregate([
      { $match: { end_time: { $ne: null } } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user.department",
          totalMillis: { $sum: { $subtract: ["$end_time", "$start_time"] } }
        }
      }
    ]);

    const reportMap = {};
    let totalHoursAll = 0;

    usersPerDept.forEach(u => {
      const dept = u._id || "Ohne Abteilung";
      reportMap[dept] = { department: dept, count: u.count, hours: 0 };
    });

    hoursPerDept.forEach(h => {
      const dept = h._id || "Ohne Abteilung";
      const hours = h.totalMillis / (1000 * 60 * 60);

      if (!reportMap[dept]) {
        reportMap[dept] = { department: dept, count: 0, hours: 0 };
      }
      reportMap[dept].hours = hours;
      totalHoursAll += hours;
    });

    res.json({
      userCount,
      departments: departmentsCount,
      totalHours: totalHoursAll,
      byDepartment: Object.values(reportMap)
    });

  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ error: "Fehler beim Erstellen des Berichts" });
  }
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

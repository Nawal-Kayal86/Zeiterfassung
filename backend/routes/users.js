// routes/users.js
import express from "express";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();
const FULL_YEAR_VACATION_DAYS = 25;

function calculateVacationDaysForCurrentYear(startDateValue, endDateValue = null) {
  if (!startDateValue) return FULL_YEAR_VACATION_DAYS;

  const today = new Date();
  const year = today.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  const employmentStart = new Date(startDateValue);
  const employmentEnd = endDateValue ? new Date(endDateValue) : yearEnd;

  if (Number.isNaN(employmentStart.getTime())) return FULL_YEAR_VACATION_DAYS;
  if (Number.isNaN(employmentEnd.getTime())) return FULL_YEAR_VACATION_DAYS;

  const activeStart = employmentStart > yearStart ? employmentStart : yearStart;
  const activeEnd = employmentEnd < yearEnd ? employmentEnd : yearEnd;

  if (activeEnd < activeStart) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const activeDays = Math.floor((activeEnd - activeStart) / msPerDay) + 1;
  const totalDaysInYear = Math.floor((yearEnd - yearStart) / msPerDay) + 1;
  const calculatedDays = (activeDays / totalDaysInYear) * FULL_YEAR_VACATION_DAYS;

  return Math.round(calculatedDays * 100) / 100;
}

// 📄 GET: Nur Namen und Abteilungen aller User
router.get("/names", auth("admin"), async (req, res) => {
  try {
    const users = await User.find({}, "name department").sort({ name: 1 });
    res.json(
      users.map((u) => ({ id: u._id, name: u.name, department: u.department })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Benutzernamen" });
  }
});

// 📄 GET: Alle Benutzer
router.get("/", auth("admin"), async (req, res) => {
  try {
    const users = await User.find(
      {},
      "name email role department nfc_tag start_date end_date is_active vacation_days_per_year weekly_hours work_schedule created_at",
    ).sort({ created_at: -1 });
    res.json(
      users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        nfc_tag: u.nfc_tag,
        start_date: u.start_date,
        end_date: u.end_date,
        is_active: u.is_active !== false, // default true
        vacation_days_per_year: u.vacation_days_per_year || 25,
        weekly_hours: u.weekly_hours || 40,
        work_schedule: u.work_schedule || null,
        created_at: u.created_at,
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Benutzer" });
  }
});

// 📄 GET: Einzelner Benutzer
router.put("/profile/update", auth(), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Benutzer nicht gefunden" });

    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) return res.status(409).json({ error: "E-Mail bereits vergeben" });
      user.email = email;
    }
    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: "Profil erfolgreich aktualisiert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Profil-Update" });
  }
});

router.get("/:id", auth("admin"), async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "name email role department nfc_tag start_date end_date is_active vacation_days_per_year weekly_hours work_schedule created_at",
    );
    if (!user)
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      nfc_tag: user.nfc_tag,
      start_date: user.start_date,
      end_date: user.end_date,
      is_active: user.is_active !== false,
      vacation_days_per_year: user.vacation_days_per_year || 25,
      weekly_hours: user.weekly_hours || 40,
      work_schedule: user.work_schedule || null,
      created_at: user.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden des Benutzers" });
  }
});

// ➕ POST: Neuen Benutzer anlegen
router.post("/", auth("admin"), async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      department,
      nfc_tag,
      password,
      start_date,
      end_date,
      is_active,
      weekly_hours,
      work_schedule,
    } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ error: "Name, Email und Passwort erforderlich" });

    const exists = await User.findOne({ $or: [{ email }, { nfc_tag }] });
    if (exists)
      return res
        .status(409)
        .json({ error: "E-Mail oder NFC-Tag bereits vergeben" });

    const password_hash = await bcrypt.hash(password, 10);
    const calculatedVacationDays = calculateVacationDaysForCurrentYear(
      start_date,
      end_date,
    );
    const newUser = await User.create({
      name,
      email,
      role: ["user", "admin"].includes(role) ? role : "user",
      department: department || null,
      nfc_tag: nfc_tag || null,
      start_date: start_date || null,
      end_date: end_date || null,
      is_active: is_active !== false,
      vacation_days_per_year: calculatedVacationDays,
      weekly_hours: Number(weekly_hours) || 40,
      work_schedule: work_schedule || undefined,
      password_hash,
    });

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      nfc_tag: newUser.nfc_tag,
      start_date: newUser.start_date,
      end_date: newUser.end_date,
      vacation_days_per_year: newUser.vacation_days_per_year,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Anlegen" });
  }
});

// ✏️ PUT: Benutzer aktualisieren
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      department,
      nfc_tag,
      password,
      start_date,
      end_date,
      is_active,
      weekly_hours,
      work_schedule,
    } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Benutzer nicht gefunden" });

    if (email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (emailExists) {
        return res.status(409).json({ error: "E-Mail bereits vergeben" });
      }
    }

    if (nfc_tag) {
      const nfcExists = await User.findOne({
        nfc_tag,
        _id: { $ne: req.params.id },
      });
      if (nfcExists) {
        return res.status(409).json({ error: "NFC-Tag bereits vergeben" });
      }
    }

    // Felder aktualisieren
    user.name = name;
    user.email = email;
    user.role = ["user", "admin"].includes(role) ? role : user.role;
    user.department = department || user.department;
    user.nfc_tag = nfc_tag || user.nfc_tag;
    user.start_date = start_date || user.start_date;
    user.end_date = end_date !== undefined ? (end_date || null) : user.end_date;
    user.is_active = is_active !== undefined ? is_active : user.is_active;
    user.vacation_days_per_year = calculateVacationDaysForCurrentYear(
      user.start_date,
      user.end_date,
    );
    user.weekly_hours = Number(weekly_hours) || user.weekly_hours;

    if (work_schedule) {
      user.work_schedule = work_schedule;
      user.markModified("work_schedule"); // ⚠️ WICHTIG für Nested Objects!
    }

    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: "Benutzer erfolgreich aktualisiert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Update" });
  }
});

// ❌ DELETE: Benutzer löschen
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    res.json({ message: "Benutzer erfolgreich gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});

// ✏️ PUT: Eigenes Profil/Passwort aktualisieren (für alle User)
export default router;

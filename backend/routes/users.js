// routes/users.js
import express from 'express';
import bcrypt from 'bcrypt';
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// 📄 GET: Nur Namen und Abteilungen aller User
router.get("/names", auth("admin"), async (req, res) => {
  try {
    const users = await User.find({}, "name department").sort({ name: 1 });
    res.json(users.map(u => ({ id: u._id, name: u.name, department: u.department })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Benutzernamen" });
  }
});

// 📄 GET: Alle Benutzer
router.get("/", auth("admin"), async (req, res) => {
  try {
    const users = await User.find({}, "name email role department nfc_tag start_date is_active created_at").sort({ created_at: -1 });
    res.json(users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      nfc_tag: u.nfc_tag,
      start_date: u.start_date,
      is_active: u.is_active !== false, // default true
      created_at: u.created_at
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Benutzer" });
  }
});

// 📄 GET: Einzelner Benutzer
router.get("/:id", auth("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "name email role department nfc_tag start_date is_active created_at");
    if (!user) return res.status(404).json({ error: "Benutzer nicht gefunden" });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      nfc_tag: user.nfc_tag,
      start_date: user.start_date,
      is_active: user.is_active !== false,
      created_at: user.created_at
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden des Benutzers" });
  }
});

// ✏️ POST: Benutzer anlegen
router.post("/", auth("admin"), async (req, res) => {
  try {
    const { name, email, role, department, nfc_tag, password, start_date, is_active } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, Email und Passwort erforderlich" });

    const exists = await User.findOne({ $or: [{ email }, { nfc_tag }] });
    if (exists) return res.status(409).json({ error: "E-Mail oder NFC-Tag bereits vergeben" });

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      role: ["user", "admin"].includes(role) ? role : "user",
      department: department || null,
      nfc_tag: nfc_tag || null,
      start_date: start_date || null,
      is_active: is_active !== false,
      password_hash
    });

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      nfc_tag: newUser.nfc_tag
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Anlegen" });
  }
});

// ✏️ PUT: Benutzer aktualisieren
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const { name, email, role, department, nfc_tag, password, start_date, is_active } = req.body;
    const updateData = {
      name,
      email,
      role: ["user", "admin"].includes(role) ? role : "user",
      department: department || null,
      nfc_tag: nfc_tag || null,
      start_date: start_date || null,
      is_active: is_active !== false
    };
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Benutzer nicht gefunden" });

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
    if (!deleted) return res.status(404).json({ error: "Benutzer nicht gefunden" });
    res.json({ message: "Benutzer erfolgreich gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});


export default router;

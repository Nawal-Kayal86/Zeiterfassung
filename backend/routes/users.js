// backend/routes/users.js
import express from 'express';
import bcrypt from 'bcrypt';
import { initDB } from '../db.js';
import { auth } from "../middleware/auth.js";

const router = express.Router();
const pool = await initDB();

// 📄 GET: Nur Namen und Abteilungen aller User (statisch → zuerst!)
router.get("/names", auth("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, department FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der User-Namen" });
  }
});

// 📄 GET: Alle User
router.get("/", auth("admin"), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, department, nfc_tag, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der User" });
  }
});

// 📄 GET: Einzelner User
router.get("/:id", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, department, nfc_tag, created_at FROM users WHERE id = ?",
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "User nicht gefunden" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden des Users" });
  }
});

// ✏️ POST: User anlegen
router.post("/", auth("admin"), async (req, res) => {
  try {
    const { name, email, role, department, nfc_tag, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, Email und Passwort erforderlich" });

    const safeRole = ["user", "admin"].includes(role) ? role : "user";
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (name, email, role, department, nfc_tag, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, safeRole, department || null, nfc_tag || null, password_hash]
    );

    res.status(201).json({ id: result.insertId, name, email, role: safeRole, department, nfc_tag });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "E-Mail oder NFC-Tag bereits vergeben" });
    res.status(500).json({ error: "Fehler beim Anlegen" });
  }
});

// ✏️ PUT: User aktualisieren
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, nfc_tag, password } = req.body;
    const safeRole = ["user", "admin"].includes(role) ? role : "user";

    let query = "UPDATE users SET name = ?, email = ?, role = ?, department = ?, nfc_tag = ?";
    const params = [name, email, safeRole, department || null, nfc_tag || null];

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query += ", password_hash = ?";
      params.push(password_hash);
    }

    query += " WHERE id = ?";
    params.push(id);

    const [result] = await pool.execute(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User nicht gefunden" });

    res.json({ message: "User erfolgreich aktualisiert" });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "E-Mail oder NFC-Tag bereits vergeben" });
    res.status(500).json({ error: "Fehler beim Update" });
  }
});

// ❌ DELETE: User löschen
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User nicht gefunden" });
    res.json({ message: "User erfolgreich gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});

export default router;

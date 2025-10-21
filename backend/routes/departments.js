// routes/departments.js
import express from "express";
import { initDB } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const pool = await initDB();

// ✅ Alle Abteilungen abrufen
router.get("/", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM departments ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    console.error("Fehler beim Laden der Abteilungen:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// // ✅ Neue Abteilung hinzufügen (Admin)
// router.post("/", auth("admin"), async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ error: "Name ist erforderlich" });

//     const [result] = await pool.query("INSERT INTO departments (name) VALUES (?)", [name]);
//     const [newDept] = await pool.query("SELECT id, name FROM departments WHERE id = ?", [result.insertId]);
//     res.status(201).json(newDept[0]);
//   } catch (err) {
//     console.error("Fehler beim Hinzufügen:", err);
//     res.status(500).json({ error: "DB error" });
//   }
// });

// ✅ Neue Abteilung hinzufügen (Admin)
router.post("/", auth("admin"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name ist erforderlich" });

    // Einfügen versuchen
    const [result] = await pool.query("INSERT INTO departments (name) VALUES (?)", [name]);
    const [newDept] = await pool.query("SELECT id, name FROM departments WHERE id = ?", [result.insertId]);
    return res.status(201).json({ message: "Abteilung erfolgreich angelegt", department: newDept[0] });
  } catch (err) {
    // 🔥 Duplikat prüfen
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Abteilung existiert bereits" });
    }

    console.error("Fehler beim Hinzufügen:", err);
    return res.status(500).json({ error: "DB error" });
  }
});


// ✅ Abteilung bearbeiten (Admin)
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name ist erforderlich" });

    await pool.query("UPDATE departments SET name = ? WHERE id = ?", [name, id]);
    const [updated] = await pool.query("SELECT id, name FROM departments WHERE id = ?", [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Fehler beim Bearbeiten:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ Abteilung löschen (Admin)
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM departments WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ error: "DB error" });
  }
});

export default router;

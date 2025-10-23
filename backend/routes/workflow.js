import express from "express";
import { initDB } from "../db.js";

const router = express.Router();
const pool = await initDB();


// ✅ Workflow – alle Tasks abrufen
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM workflow ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Fehler beim Abrufen:", err);
    res.status(500).json({ error: "Fehler beim Laden der Workflow-Daten" });
  }
});

// ✅ Workflow – neuen Task hinzufügen
router.post("/", async (req, res) => {
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
router.put("/:id/done", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM workflow WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ error: "Fehler beim Löschen des Tasks" });
  }
});

export default router;
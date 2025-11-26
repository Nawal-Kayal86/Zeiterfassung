// routes/workflow.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Workflow from "../models/Workflow.js";

const router = express.Router();

// ✅ Workflow – alle Tasks abrufen
router.get("/", auth(), async (req, res) => {
  try {
    const tasks = await Workflow.find().sort({ _id: -1 }).populate("userid", "name role department");
    res.json(tasks.map(t => ({
      id: t._id,
      task: t.task,
      status: t.status,
      created_at: t.created_at,
      userid: t.userid
    })));
  } catch (err) {
    console.error("Fehler beim Abrufen:", err);
    res.status(500).json({ error: "Fehler beim Laden der Workflow-Daten" });
  }
});

// ✅ Workflow – neuen Task hinzufügen
router.post("/", auth(), async (req, res) => {
  try {
    const { task, status, userid } = req.body;
    if (!task || !userid) return res.status(400).json({ error: "Task-Name und Benutzer-ID erforderlich" });

    const newTask = await Workflow.create({
      task,
      status: status || "open",
      userid
    });

    res.status(201).json({
      id: newTask._id,
      task: newTask.task,
      status: newTask.status,
      created_at: newTask.created_at,
      userid: newTask.userid
    });
  } catch (err) {
    console.error("Fehler beim Hinzufügen:", err);
    res.status(500).json({ error: "Fehler beim Speichern des Tasks" });
  }
});

// ✅ Task als "done" markieren
router.put("/:id/done", auth(), async (req, res) => {
  try {
    const updated = await Workflow.findByIdAndUpdate(
      req.params.id,
      { status: "done" },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Task nicht gefunden" });

    res.json({
      id: updated._id,
      task: updated.task,
      status: updated.status,
      created_at: updated.created_at,
      userid: updated.userid
    });
  } catch (err) {
    console.error("Fehler beim Aktualisieren:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Tasks" });
  }
});

// ❌ Task löschen
router.delete("/:id", auth(), async (req, res) => {
  try {
    const deleted = await Workflow.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Task nicht gefunden" });
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ error: "Fehler beim Löschen des Tasks" });
  }
});

export default router;

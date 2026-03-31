// routes/workflow.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Workflow from "../models/Workflow.js";

const router = express.Router();

// ✅ Workflow – alle Tasks abrufen
router.get("/", auth(), async (req, res) => {
  try {
    const tasks = await Workflow.find()
      .populate("user_id", "name department")
      .sort({ created_at: -1 });

    res.json(
      tasks.map((t) => ({
        id: t._id,
        task: t.task,
        status: t.status,
        created_at: t.created_at,
        user: {
          name: t.user_id?.name || "-",
          department: t.user_id?.department || "-",
        },
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Workflow-Daten" });
  }
});

// ✅ Workflow – neuen Task hinzufügen
router.post("/", auth(), async (req, res) => {
  try {
    const { task, status } = req.body;
    if (!task) {
      return res.status(400).json({ error: "Task erforderlich" });
    }

    const newTask = await Workflow.create({
      task,
      status: status || "open",
      user_id: req.user.id, // Aus dem Token
    });

    res.status(201).json({
      id: newTask._id,
      task: newTask.task,
      status: newTask.status,
      created_at: newTask.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Speichern des Tasks" });
  }
});

// ✅ Task als "done" markieren
router.put("/:id/done", auth(), async (req, res) => {
  const updated = await Workflow.findByIdAndUpdate(
    req.params.id,
    { status: "done" },
    { new: true },
  );
  res.json(updated);
});

// ❌ Task löschen
router.delete("/:id", auth(), async (req, res) => {
  await Workflow.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;

// routes/departments.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Department from "../models/Department.js";

const router = express.Router();

// ✅ Alle Abteilungen abrufen
router.get("/", auth(), async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments.map((d) => ({ id: d._id, name: d.name })));
  } catch (err) {
    console.error("Fehler beim Laden der Abteilungen:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// ✅ Neue Abteilung hinzufügen (Admin)
router.post("/", auth("admin"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name ist erforderlich" });

    const exists = await Department.findOne({ name });
    if (exists)
      return res.status(409).json({ error: "Abteilung existiert bereits" });

    const newDept = await Department.create({ name });
    res
      .status(201)
      .json({
        message: "Abteilung erfolgreich angelegt",
        department: { id: newDept._id, name: newDept.name },
      });
  } catch (err) {
    console.error("Fehler beim Hinzufügen:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// ✅ Abteilung bearbeiten (Admin)
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name ist erforderlich" });

    const updated = await Department.findByIdAndUpdate(
      id,
      { name },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ error: "Abteilung nicht gefunden" });

    res.json({ id: updated._id, name: updated.name });
  } catch (err) {
    console.error("Fehler beim Bearbeiten:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// ✅ Abteilung löschen (Admin)
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ error: "Abteilung nicht gefunden" });

    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

export default router;

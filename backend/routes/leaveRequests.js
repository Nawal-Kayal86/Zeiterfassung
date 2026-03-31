import express from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Neuen Urlaubsantrag erstellen
router.post("/", auth(), async (req, res) => {
  try {
    const { from, to, type, reason } = req.body;

    if (!from || !to || !reason) {
      return res.status(400).json({ error: "Fehlende Daten" });
    }

    const request = await LeaveRequest.create({
      from,
      to,
      type,
      reason,
      user_id: req.user.id,
      status: "pending",
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Absenden des Antrags" });
  }
});

// Benutzer sieht nur seine eigenen Anträge
router.get("/", auth(), async (req, res) => {
  try {
    const requests = await LeaveRequest.find({
      user_id: req.user.id, // Wichtige Filterung
    }).sort({ created_at: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Anträge" });
  }
});

/* =========================
        Kalender
========================= */

router.get("/calendar", auth(), async (req, res) => {
  const { userId } = req.query;
  const query = { status: "approved" };

  if (req.user.role !== "admin") {
    query.user_id = req.user.id;
  } else if (userId) {
    query.user_id = userId;
  }

  const leaves = await LeaveRequest.find(query).populate("user_id", "name");
  res.json(leaves);
});

// Admin sieht alle Anträge
router.get("/admin", auth("admin"), async (req, res) => {
  const requests = await LeaveRequest.find()
    .populate("user_id", "name department")
    .sort({ createdAt: -1 });

  res.json(requests);
});

// Admin: Antrag genehmigen
router.put("/:id/approve", auth("admin"), async (req, res) => {
  const updated = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    { status: "approved", decided_by: req.user.id },
    { new: true },
  );
  res.json(updated);
});

// Admin: Antrag ablehnen
router.put("/:id/reject", auth("admin"), async (req, res) => {
  const updated = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", decided_by: req.user.id },
    { new: true },
  );
  res.json(updated);
});

// Benutzer/Admin: Antrag löschen
router.delete("/:id", auth(), async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Antrag nicht gefunden" });

    // Berechtigungs-Check
    const isOwner = request.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Keine Berechtigung zum Löschen dieses Antrags" });
    }

    // Nutzer dürfen nur "pending" Anträge löschen
    if (!isAdmin && request.status !== "pending") {
      return res.status(400).json({ error: "Genehmigte oder abgelehnte Anträge können nicht mehr gelöscht werden. Bitte kontaktiere die IT/HR." });
    }

    await request.deleteOne();
    res.json({ message: "Antrag erfolgreich gelöscht ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Antrags" });
  }
});

export default router;

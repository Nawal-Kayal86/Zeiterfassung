import express from "express";
import Log from "../models/Log.js";
import { checkDailyLogs } from "../services/validationService.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/logs
router.get("/", auth(), async (req, res) => {
    try {
        // Starte Validierung und warte auf Abschluss
        await checkDailyLogs().catch(err => console.error("Validation error:", err));

        const query = req.user.role === 'admin' ? {} : { user_id: req.user.id };

        // Neueste Logs zuerst, maximal 100
        const logs = await Log.find(query).populate("user_id", "name").sort({ created_at: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fehler beim Laden der Logs" });
    }
});

export default router;

import express from "express";
import Log from "../models/Log.js";

const router = express.Router();

// GET /api/logs
router.get("/", async (req, res) => {
    try {
        // Neueste Logs zuerst, maximal 100
        const logs = await Log.find().sort({ created_at: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fehler beim Laden der Logs" });
    }
});

export default router;

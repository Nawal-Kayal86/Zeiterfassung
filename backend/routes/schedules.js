import express from "express"
import Schedule from "../models/Schedule.js"

const router = express.Router()

// GET all schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: 1 })
    res.json(schedules)
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Laden des Dienstplans" })
  }
})

// POST new schedule
router.post("/", async (req, res) => {
  try {
    const schedule = new Schedule(req.body)
    await schedule.save()
    res.status(201).json(schedule)
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Speichern" })
  }
})

// PUT update schedule
router.put("/:id", async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Aktualisieren" })
  }
})


router.delete("/:id", async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Löschen" })
  }
})




export default router

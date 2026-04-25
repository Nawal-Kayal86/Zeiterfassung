import { getScheduleForUser, saveSchedule } from "../services/scheduleService.js";

export async function getSchedule(req, res) {
  res.json(await getScheduleForUser(req.user, req.params.userId));
}

export async function saveScheduleController(req, res) {
  res.json(await saveSchedule(req.body));
}

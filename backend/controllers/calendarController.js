import { getCalendar, saveCalendar } from "../services/calendarService.js";

export async function getCalendarController(req, res) {
  res.json(await getCalendar(req.query));
}

export async function saveCalendarController(req, res) {
  res.json(await saveCalendar(req.body));
}

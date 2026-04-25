import { getLogs } from "../services/logService.js";

export async function listLogs(req, res) {
  res.json(await getLogs(req.user));
}

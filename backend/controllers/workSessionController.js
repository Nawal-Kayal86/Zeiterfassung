import {
  deleteWorkSession,
  getWorkSessions,
  getWorkSessionSummary,
  saveManualWorkSession,
  startWorkSession,
  stopWorkSession,
  updateWorkSession,
} from "../services/workSessionService.js";

export async function startWorkSessionController(req, res) {
  res.json(await startWorkSession(req.user));
}

export async function stopWorkSessionController(req, res) {
  res.json(await stopWorkSession(req.user, req.body));
}

export async function saveManualWorkSessionController(req, res) {
  res.json(await saveManualWorkSession(req.user, req.body));
}

export async function listWorkSessions(req, res) {
  res.json(await getWorkSessions(req.user, req.query));
}

export async function getWorkSessionSummaryController(req, res) {
  res.json(await getWorkSessionSummary(req.user, req.query));
}

export async function deleteWorkSessionController(req, res) {
  res.json(await deleteWorkSession(req.params.id, req.user));
}

export async function updateWorkSessionController(req, res) {
  res.json(await updateWorkSession(req.params.id, req.user, req.body));
}

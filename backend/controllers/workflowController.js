import {
  createWorkflow,
  deleteWorkflow,
  getWorkflows,
  markWorkflowDone,
} from "../services/workflowService.js";
import { sendCreated } from "../utils/http.js";

export async function listWorkflows(req, res) {
  res.json(await getWorkflows(req.user));
}

export async function createWorkflowController(req, res) {
  const createdWorkflow = await createWorkflow(req.user, req.body);
  sendCreated(req, res, createdWorkflow, `${req.baseUrl}/${createdWorkflow.id}`);
}

export async function markWorkflowDoneController(req, res) {
  res.json(await markWorkflowDone(req.params.id, req.user));
}

export async function deleteWorkflowController(req, res) {
  res.json(await deleteWorkflow(req.params.id, req.user));
}

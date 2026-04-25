import Workflow from "../models/Workflow.js";
import { ensureObjectId, normalizeTrimmedString } from "../utils/request.js";
import { createHttpError } from "../utils/http.js";

export async function getWorkflows(user) {
  const query = user.role === "admin" ? {} : { user_id: user.id };
  const tasks = await Workflow.find(query)
    .populate("user_id", "name department")
    .sort({ created_at: -1 })
    .lean();

  return tasks.map((task) => ({
    id: task._id,
    task: task.task,
    status: task.status,
    created_at: task.created_at,
    user: {
      id: task.user_id?._id || null,
      name: task.user_id?.name || "-",
      department: task.user_id?.department || "-",
    },
  }));
}

export async function createWorkflow(user, body) {
  const task = normalizeTrimmedString(body.task, { maxLength: 500 });
  const status = body.status === "done" ? "done" : "open";

  if (!task) {
    throw createHttpError(400, "Task erforderlich");
  }

  const newTask = await Workflow.create({
    task,
    status,
    user_id: user.id,
  });

  return {
    id: newTask._id,
    task: newTask.task,
    status: newTask.status,
    created_at: newTask.created_at,
  };
}

export async function markWorkflowDone(id, user) {
  ensureObjectId(id);
  const filter = user.role === "admin" ? { _id: id } : { _id: id, user_id: user.id };
  const task = await Workflow.findOneAndUpdate(
    filter,
    { status: "done" },
    { new: true, runValidators: true },
  ).lean();

  if (!task) {
    const exists = await Workflow.exists({ _id: id });
    throw createHttpError(exists ? 403 : 404, exists ? "Keine Berechtigung" : "Task nicht gefunden");
  }

  return task;
}

export async function deleteWorkflow(id, user) {
  ensureObjectId(id);
  const filter = user.role === "admin" ? { _id: id } : { _id: id, user_id: user.id };
  const task = await Workflow.findOneAndDelete(filter).lean();

  if (!task) {
    const exists = await Workflow.exists({ _id: id });
    throw createHttpError(exists ? 403 : 404, exists ? "Keine Berechtigung" : "Task nicht gefunden");
  }

  return { success: true };
}

import Department from "../models/Department.js";
import { ensureObjectId, normalizeTrimmedString } from "../utils/request.js";
import { createHttpError } from "../utils/http.js";

export async function getDepartments() {
  const departments = await Department.find().sort({ name: 1 }).lean();
  return departments.map((department) => ({ id: department._id, name: department.name }));
}

export async function createDepartment(body) {
  const name = normalizeTrimmedString(body.name, { maxLength: 100 });
  if (!name) {
    throw createHttpError(400, "Name ist erforderlich");
  }

  const exists = await Department.findOne({ name }).lean();
  if (exists) {
    throw createHttpError(409, "Abteilung existiert bereits");
  }

  const newDepartment = await Department.create({ name });
  return {
    message: "Abteilung erfolgreich angelegt",
    department: { id: newDepartment._id, name: newDepartment.name },
  };
}

export async function updateDepartment(id, body) {
  ensureObjectId(id);
  const name = normalizeTrimmedString(body.name, { maxLength: 100 });
  if (!name) {
    throw createHttpError(400, "Name ist erforderlich");
  }

  const updated = await Department.findByIdAndUpdate(
    id,
    { name },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw createHttpError(404, "Abteilung nicht gefunden");
  }

  return { id: updated._id, name: updated.name };
}

export async function deleteDepartment(id) {
  ensureObjectId(id);
  const deleted = await Department.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw createHttpError(404, "Abteilung nicht gefunden");
  }

  return { success: true };
}

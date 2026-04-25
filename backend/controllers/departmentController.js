import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../services/departmentService.js";
import { sendCreated } from "../utils/http.js";

export async function listDepartments(req, res) {
  res.json(await getDepartments());
}

export async function createDepartmentController(req, res) {
  const createdDepartment = await createDepartment(req.body);
  sendCreated(
    req,
    res,
    createdDepartment,
    `${req.baseUrl}/${createdDepartment.department.id}`,
  );
}

export async function updateDepartmentController(req, res) {
  res.json(await updateDepartment(req.params.id, req.body));
}

export async function deleteDepartmentController(req, res) {
  res.json(await deleteDepartment(req.params.id));
}

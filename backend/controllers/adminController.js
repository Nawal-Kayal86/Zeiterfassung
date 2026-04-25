import {
  getAdminUsersOverview,
  getAttendance,
  getReports,
} from "../services/adminService.js";

export async function getUsersOverview(req, res) {
  const result = await getAdminUsersOverview();
  res.json(result);
}

export async function getAttendanceController(req, res) {
  const result = await getAttendance(req.user);
  res.json(result);
}

export async function getReportsController(req, res) {
  const result = await getReports();
  res.json(result);
}

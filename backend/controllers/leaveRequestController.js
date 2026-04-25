import {
  approveLeaveRequest,
  createLeaveRequest,
  deleteLeaveRequest,
  getAdminLeaveRequests,
  getLeaveCalendar,
  getOwnLeaveRequests,
  rejectLeaveRequest,
} from "../services/leaveRequestService.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { sendCreated } from "../utils/http.js";

export async function createLeaveRequestController(req, res) {
  const createdRequest = await createLeaveRequest(req.user, req.body);
  sendCreated(req, res, createdRequest, `${req.baseUrl}/${createdRequest._id}`);
}

export async function listOwnLeaveRequests(req, res) {
  res.json(await getOwnLeaveRequests(req.user.id));
}

export async function getLeaveCalendarController(req, res) {
  res.json(await getLeaveCalendar(req.user, req.query));
}

export async function listAdminLeaveRequests(req, res) {
  const currentUser = req.user;

  if (currentUser.role === 'admin') {
    res.json(await getAdminLeaveRequests());
  } else if (currentUser.role === 'department_leader') {
    // Department leaders sehen nur Anträge von Usern in ihrer Abteilung
    const allRequests = await getAdminLeaveRequests();
    const filteredRequests = allRequests.filter(request => request.user?.department === currentUser.department);
    res.json(filteredRequests);
  } else {
    res.status(403).json({ error: 'Zugriff verweigert' });
  }
}

export async function approveLeaveRequestController(req, res) {
  const currentUser = req.user;
  const requestId = req.params.id;

  if (currentUser.role === 'admin') {
    res.json(await approveLeaveRequest(requestId, currentUser.id));
  } else if (currentUser.role === 'department_leader') {
    // Prüfe, ob der Antrag von einem User in der Abteilung ist
    const request = await LeaveRequest.findById(requestId).populate('user').lean();
    if (!request || request.user.department !== currentUser.department) {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }
    res.json(await approveLeaveRequest(requestId, currentUser.id));
  } else {
    res.status(403).json({ error: 'Zugriff verweigert' });
  }
}

export async function rejectLeaveRequestController(req, res) {
  const currentUser = req.user;
  const requestId = req.params.id;

  if (currentUser.role === 'admin') {
    res.json(await rejectLeaveRequest(requestId, currentUser.id));
  } else if (currentUser.role === 'department_leader') {
    // Prüfe, ob der Antrag von einem User in der Abteilung ist
    const request = await LeaveRequest.findById(requestId).populate('user').lean();
    if (!request || request.user.department !== currentUser.department) {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }
    res.json(await rejectLeaveRequest(requestId, currentUser.id));
  } else {
    res.status(403).json({ error: 'Zugriff verweigert' });
  }
}

export async function deleteLeaveRequestController(req, res) {
  res.json(await deleteLeaveRequest(req.params.id, req.user));
}

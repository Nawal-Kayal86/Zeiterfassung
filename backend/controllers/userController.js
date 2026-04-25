import {
  createUser,
  deleteUser,
  getUserById,
  getUserNames,
  getUsers,
  updateOwnProfile,
  updateUser,
} from "../services/userService.js";
import { createLogEntry } from "../services/logService.js";
import { sendCreated } from "../utils/http.js";

export async function listUserNames(req, res) {
  res.json(await getUserNames());
}

export async function listUsers(req, res) {
  const currentUser = req.user;
  let users;

  if (currentUser.role === 'admin') {
    users = await getUsers();
  } else if (currentUser.role === 'department_leader') {
    // Department leaders sehen nur User in ihrer Abteilung
    const allUsers = await getUsers();
    users = allUsers.filter(user => user.department === currentUser.department);
  } else {
    return res.status(403).json({ error: 'Zugriff verweigert' });
  }

  res.json(users);
}

export async function updateProfile(req, res) {
  const result = await updateOwnProfile(req.user.id, req.body);

  if (result.changedPassword) {
    await createLogEntry({
      message: `Passwort geaendert: ${result.userName}`,
      level: "INFO",
      userId: req.user.id,
    });
  }

  if (result.changedName || result.changedEmail) {
    await createLogEntry({
      message: `Profil aktualisiert: ${result.userName}`,
      level: "INFO",
      userId: req.user.id,
    });
  }

  res.json(result);
}

export async function getUser(req, res) {
  const targetUserId = req.params.id;
  const currentUser = req.user;

  if (currentUser.role !== 'admin') {
    if (currentUser.role === 'department_leader') {
      const targetUser = await User.findById(targetUserId).select('department').lean();
      if (!targetUser || targetUser.department !== currentUser.department) {
        return res.status(403).json({ error: 'Zugriff verweigert' });
      }
    } else {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }
  }

  res.json(await getUserById(targetUserId));
}

export async function createUserController(req, res) {
  const createdUser = await createUser(req.body);
  sendCreated(req, res, createdUser, `${req.baseUrl}/${createdUser.id}`);
}

export async function updateUserController(req, res) {
  const targetUserId = req.params.id;
  const currentUser = req.user;

  // Admins können alles
  if (currentUser.role !== 'admin') {
    // Department leaders können nur User in ihrer Abteilung bearbeiten
    if (currentUser.role === 'department_leader') {
      const targetUser = await User.findById(targetUserId).select('department').lean();
      if (!targetUser || targetUser.department !== currentUser.department) {
        return res.status(403).json({ error: 'Zugriff verweigert: Nur User in Ihrer Abteilung können bearbeitet werden.' });
      }
    } else {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }
  }

  res.json(await updateUser(targetUserId, req.body));
}

export async function deleteUserController(req, res) {
  res.json(await deleteUser(req.params.id));
}

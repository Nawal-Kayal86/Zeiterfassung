import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createHttpError } from "../utils/http.js";

export async function loginUser({ name, email, identifier, password }) {
  const normalizedIdentifier = normalizeLoginIdentifier({ name, email, identifier });

  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, "Server-Konfiguration unvollstaendig");
  }

  if (!normalizedIdentifier || typeof password !== "string" || password.length < 1) {
    throw createHttpError(400, "Name oder E-Mail und Passwort sind erforderlich");
  }

  const user = await User.findOne(buildLoginQuery(normalizedIdentifier)).lean();
  if (!user) {
    throw createHttpError(401, "Login fehlgeschlagen");
  }

  if (user.is_active === false) {
    throw createHttpError(403, "Benutzerkonto ist inaktiv");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw createHttpError(401, "Login fehlgeschlagen");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "12h",
      algorithm: "HS256",
      issuer: process.env.JWT_ISSUER || "zeiterfassung-api",
      audience: process.env.JWT_AUDIENCE || "zeiterfassung-client",
    },
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email || "",
      role: user.role,
      department: user.department || "",
      start_date: user.start_date || null,
      end_date: user.end_date || null,
      is_active: user.is_active,
      vacation_days_per_year: user.vacation_days_per_year || 25,
    },
  };
}

function normalizeLoginIdentifier({ name, email, identifier }) {
  const rawIdentifier = [identifier, email, name].find((value) => typeof value === "string");
  return rawIdentifier ? rawIdentifier.trim() : "";
}

function buildLoginQuery(identifier) {
  const normalizedEmail = identifier.toLowerCase();

  return {
    $or: [
      { name: identifier },
      { email: normalizedEmail },
    ],
  };
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId)
    .select("name email role department start_date end_date vacation_days_per_year is_active")
    .lean();

  if (!user) {
    throw createHttpError(404, "Benutzer nicht gefunden");
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email || "",
      role: user.role,
      department: user.department,
      start_date: user.start_date || null,
      end_date: user.end_date || null,
      vacation_days_per_year: user.vacation_days_per_year || 25,
      is_active: user.is_active,
    },
  };
}

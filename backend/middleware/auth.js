import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getBearerToken } from "../utils/request.js";
import { sendError } from "../utils/http.js";

export function auth(requiredRole = null) {
  return async (req, res, next) => {
    try {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET ist nicht gesetzt");
        return sendError(res, 500, "Server-Konfiguration unvollstaendig");
      }

      const token = getBearerToken(req.headers.authorization);
      if (!token) {
        return sendError(res, 401, "Kein Token vorhanden");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: process.env.JWT_ISSUER || "zeiterfassung-api",
        audience: process.env.JWT_AUDIENCE || "zeiterfassung-client",
      });

      const user = await User.findById(decoded.id)
        .select("_id role is_active department")
        .lean();

      if (!user || user.is_active === false) {
        return sendError(res, 401, "Benutzerkonto ist nicht mehr gueltig");
      }

      if (requiredRole && user.role !== requiredRole) {
        return sendError(res, 403, "Zugriff verweigert");
      }

      req.user = {
        id: String(user._id),
        role: user.role,
        department: user.department,
      };

      next();
    } catch (err) {
      if (err.name !== "TokenExpiredError" && err.name !== "JsonWebTokenError") {
        console.error("Auth error:", err);
      }

      return sendError(res, 401, "Ungueltiges Token");
    }
  };
}

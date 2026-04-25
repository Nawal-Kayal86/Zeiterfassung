import { clearFailedLoginAttempts, registerFailedLoginAttempt } from "../middleware/security.js";
import { getCurrentUser, loginUser } from "../services/authService.js";
import { createLogEntry } from "../services/logService.js";

export async function login(req, res) {
  const attemptedIdentifier = String(
    req.body?.identifier || req.body?.email || req.body?.name || "",
  ).trim();

  try {
    const result = await loginUser(req.body);
    clearFailedLoginAttempts(req.loginRateLimitKey);
    await createLogEntry({
      message: `Anmeldung erfolgreich: ${result.user.name}`,
      level: "INFO",
      userId: result.user.id,
    });
    res.json(result);
  } catch (error) {
    if (error.status === 401) {
      registerFailedLoginAttempt(req.loginRateLimitKey);
      await createLogEntry({
        message: `Fehlgeschlagene Anmeldung: ${attemptedIdentifier || "unbekannt"}`,
        level: "WARN",
      });
    }

    if (error.status === 403) {
      await createLogEntry({
        message: `Anmeldung verweigert (inaktives Konto): ${attemptedIdentifier || "unbekannt"}`,
        level: "WARN",
      });
    }

    throw error;
  }
}

export async function me(req, res) {
  const result = await getCurrentUser(req.user.id);
  res.json(result);
}

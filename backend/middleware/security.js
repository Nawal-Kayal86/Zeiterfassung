const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const loginAttempts = new Map();

function cleanupLoginAttempts(now) {
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.resetAt) {
      loginAttempts.delete(key);
    }
  }
}

function getClientKey(req) {
  const forwardedFor = typeof req.headers["x-forwarded-for"] === "string"
    ? req.headers["x-forwarded-for"].split(",")[0].trim()
    : null;

  return forwardedFor || req.ip || req.socket?.remoteAddress || "unknown";
}

function containsProhibitedKeys(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsProhibitedKeys);

  return Object.entries(value).some(([key, nestedValue]) => {
    if (key.startsWith("$") || key.includes(".")) {
      return true;
    }

    return containsProhibitedKeys(nestedValue);
  });
}

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self'; connect-src 'self' https:; font-src 'self' https:; frame-src 'self' https://zeiterfassung-mh87.onrender.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';",
  );

  next();
}

export function rejectMaliciousPayload(req, res, next) {
  if (containsProhibitedKeys(req.body) || containsProhibitedKeys(req.query) || containsProhibitedKeys(req.params)) {
    return res.status(400).json({ error: "Ungueltige Anfrage" });
  }

  next();
}

export function loginRateLimit(req, res, next) {
  const now = Date.now();
  cleanupLoginAttempts(now);

  const clientKey = getClientKey(req);
  const currentEntry = loginAttempts.get(clientKey);

  if (currentEntry && currentEntry.count >= LOGIN_MAX_ATTEMPTS && now <= currentEntry.resetAt) {
    const retryAfterSeconds = Math.ceil((currentEntry.resetAt - now) / 1000);
    res.setHeader("Retry-After", retryAfterSeconds);
    return res.status(429).json({ error: "Zu viele Login-Versuche. Bitte spaeter erneut versuchen." });
  }

  req.loginRateLimitKey = clientKey;
  next();
}

export function registerFailedLoginAttempt(clientKey) {
  if (!clientKey) return;

  const now = Date.now();
  const existingEntry = loginAttempts.get(clientKey);

  if (!existingEntry || now > existingEntry.resetAt) {
    loginAttempts.set(clientKey, {
      count: 1,
      resetAt: now + LOGIN_WINDOW_MS,
    });
    return;
  }

  existingEntry.count += 1;
}

export function clearFailedLoginAttempts(clientKey) {
  if (!clientKey) return;
  loginAttempts.delete(clientKey);
}

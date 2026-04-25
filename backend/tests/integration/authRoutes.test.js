import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

const loginUserMock = jest.fn();
const getCurrentUserMock = jest.fn();
const authMock = jest.fn();
const createLogEntryMock = jest.fn();

authMock.mockImplementation(() => (req, res, next) => {
  req.user = { id: "user-1", role: "admin" };
  next();
});

jest.unstable_mockModule("../../services/authService.js", () => ({
  loginUser: loginUserMock,
  getCurrentUser: getCurrentUserMock,
}));

jest.unstable_mockModule("../../middleware/auth.js", () => ({
  auth: authMock,
}));

jest.unstable_mockModule("../../services/logService.js", () => ({
  createLogEntry: createLogEntryMock,
  getLogs: jest.fn(),
}));

const { createApp } = await import("../../app.js");

describe("auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createLogEntryMock.mockResolvedValue(null);
  });

  it("POST /api/login liefert Token und Userdaten", async () => {
    loginUserMock.mockResolvedValue({
      token: "jwt-token",
      user: { id: "user-1", name: "Alice", role: "admin" },
    });

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .post("/api/login")
      .send({ name: "Alice", password: "secret123" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      token: "jwt-token",
      user: { id: "user-1", name: "Alice", role: "admin" },
    });
    expect(loginUserMock).toHaveBeenCalledWith({
      name: "Alice",
      password: "secret123",
    });
  });

  it("POST /api/login gibt 401 bei falschen Zugangsdaten zurueck", async () => {
    const error = new Error("Login fehlgeschlagen");
    error.status = 401;
    loginUserMock.mockRejectedValue(error);

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .post("/api/login")
      .send({ name: "Alice", password: "wrong" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Login fehlgeschlagen",
      status: 401,
    });
  });

  it("GET /api/me liefert den aktuellen Benutzer", async () => {
    getCurrentUserMock.mockResolvedValue({
      user: { id: "user-1", name: "Alice", role: "admin" },
    });

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: { id: "user-1", name: "Alice", role: "admin" },
    });
    expect(getCurrentUserMock).toHaveBeenCalledWith("user-1");
  });

  it("GET /api/me gibt 404 zurueck, wenn der Benutzer fehlt", async () => {
    const error = new Error("Benutzer nicht gefunden");
    error.status = 404;
    getCurrentUserMock.mockRejectedValue(error);

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Benutzer nicht gefunden",
      status: 404,
    });
  });
});

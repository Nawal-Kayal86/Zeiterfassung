import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

const authMock = jest.fn();
const getWorkSessionsMock = jest.fn();
const getWorkSessionSummaryMock = jest.fn();
const saveManualWorkSessionMock = jest.fn();
const deleteWorkSessionMock = jest.fn();
const startWorkSessionMock = jest.fn();
const stopWorkSessionMock = jest.fn();
const updateWorkSessionMock = jest.fn();

authMock.mockImplementation(() => (req, res, next) => {
  req.user = { id: "user-1", role: "admin" };
  next();
});

jest.unstable_mockModule("../../middleware/auth.js", () => ({
  auth: authMock,
}));

jest.unstable_mockModule("../../services/workSessionService.js", () => ({
  getWorkSessions: getWorkSessionsMock,
  getWorkSessionSummary: getWorkSessionSummaryMock,
  saveManualWorkSession: saveManualWorkSessionMock,
  deleteWorkSession: deleteWorkSessionMock,
  startWorkSession: startWorkSessionMock,
  stopWorkSession: stopWorkSessionMock,
  updateWorkSession: updateWorkSessionMock,
}));

const { createApp } = await import("../../app.js");

describe("work session routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/work-sessions/summary liefert die Summary", async () => {
    getWorkSessionSummaryMock.mockResolvedValue({
      lastStart: "2026-04-25T08:00:00.000Z",
      lastEnd: "2026-04-25T16:00:00.000Z",
      totalEntries: 12,
    });

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .get("/api/work-sessions/summary?userId=user-2")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body.totalEntries).toBe(12);
    expect(getWorkSessionSummaryMock).toHaveBeenCalledWith(
      { id: "user-1", role: "admin" },
      { userId: "user-2" },
    );
  });

  it("POST /api/workSessions/manual-time nutzt den Legacy-Pfad weiter", async () => {
    saveManualWorkSessionMock.mockResolvedValue({
      message: "Arbeitszeit manuell erfasst",
      session: { id: "session-1" },
    });

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .post("/api/workSessions/manual-time")
      .set("Authorization", "Bearer token")
      .send({ date: "2026-04-25", start: "08:00", end: "16:00" });

    expect(response.status).toBe(200);
    expect(response.headers.deprecation).toBe("true");
    expect(response.headers.link).toContain("/api/work-sessions");
    expect(response.body).toEqual({
      message: "Arbeitszeit manuell erfasst",
      session: { id: "session-1" },
    });
    expect(saveManualWorkSessionMock).toHaveBeenCalledWith(
      { id: "user-1", role: "admin" },
      { date: "2026-04-25", start: "08:00", end: "16:00" },
    );
  });

  it("POST /api/work-sessions/manual-time gibt 400 bei Edge Case zurueck", async () => {
    const error = new Error("Datum und mindestens Start oder Ende erforderlich");
    error.status = 400;
    saveManualWorkSessionMock.mockRejectedValue(error);

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .post("/api/work-sessions/manual-time")
      .set("Authorization", "Bearer token")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Datum und mindestens Start oder Ende erforderlich",
      status: 400,
    });
  });

  it("DELETE /api/work-sessions/:id gibt 403 ohne Berechtigung zurueck", async () => {
    const error = new Error("Keine Berechtigung");
    error.status = 403;
    deleteWorkSessionMock.mockRejectedValue(error);

    const app = createApp({ serveStatic: false });
    const response = await request(app)
      .delete("/api/work-sessions/session-1")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Keine Berechtigung",
      status: 403,
    });
  });
});

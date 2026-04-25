import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const findOneMock = jest.fn();
const createMock = jest.fn();
const findByIdMock = jest.fn();

jest.unstable_mockModule("../../../models/WorkSession.js", () => ({
  default: {
    findOne: findOneMock,
    create: createMock,
    findById: findByIdMock,
  },
}));

const {
  saveManualWorkSession,
  updateWorkSession,
} = await import("../../../services/workSessionService.js");

describe("workSessionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("beendet eine offene manuelle Arbeitszeit mit kleiner Hilfslogik", async () => {
    const save = jest.fn();
    const openSession = {
      start_time: new Date("2026-04-25T08:00:00.000Z"),
      save,
    };

    findOneMock
      .mockResolvedValueOnce(openSession)
      .mockResolvedValueOnce(null);

    const result = await saveManualWorkSession(
      { id: "user-1", role: "employee" },
      { date: "2026-04-25", end: "16:00", pause: "0:30" },
    );

    expect(save).toHaveBeenCalled();
    expect(result.message).toBe("Offene Arbeitszeit beendet");
    expect(openSession.pause).toBe("0:30");
    expect(openSession.end_time).toBeInstanceOf(Date);
  });

  it("aktualisiert nur autorisierte Arbeitszeiten", async () => {
    const save = jest.fn();
    const session = {
      user_id: { toString: () => "user-1" },
      start_time: new Date("2026-04-25T08:00:00.000Z"),
      end_time: new Date("2026-04-25T16:00:00.000Z"),
      pause: "0:30",
      save,
    };

    findByIdMock.mockResolvedValue(session);

    const result = await updateWorkSession(
      "507f1f77bcf86cd799439011",
      { id: "user-1", role: "employee" },
      { end: "2026-04-25T17:00:00.000Z", pause: "0:45" },
    );

    expect(result.message).toBe("Arbeitszeit aktualisiert");
    expect(save).toHaveBeenCalled();
    expect(session.pause).toBe("0:45");
    expect(session.end_time.toISOString()).toBe("2026-04-25T17:00:00.000Z");
  });
});

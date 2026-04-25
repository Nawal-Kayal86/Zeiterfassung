import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const leaveRequestFindOneMock = jest.fn();
const leaveRequestCreateMock = jest.fn();
const leaveRequestFindMock = jest.fn();
const userFindByIdMock = jest.fn();
const workScheduleFindOneMock = jest.fn();
const workSessionFindMock = jest.fn();
const holidayFindMock = jest.fn();

jest.unstable_mockModule("../../../models/LeaveRequest.js", () => ({
  default: {
    findOne: leaveRequestFindOneMock,
    create: leaveRequestCreateMock,
    find: leaveRequestFindMock,
  },
}));

jest.unstable_mockModule("../../../models/User.js", () => ({
  default: {
    findById: userFindByIdMock,
  },
}));

jest.unstable_mockModule("../../../models/WorkSchedule.js", () => ({
  default: {
    findOne: workScheduleFindOneMock,
  },
}));

jest.unstable_mockModule("../../../models/WorkSession.js", () => ({
  default: {
    find: workSessionFindMock,
  },
}));

jest.unstable_mockModule("../../../models/Holiday.js", () => ({
  Holiday: {
    find: holidayFindMock,
  },
}));

const { createLeaveRequest } = await import("../../../services/leaveRequestService.js");

function createLeanQuery(result) {
  return {
    select() {
      return this;
    },
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe("leaveRequestService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    userFindByIdMock.mockReturnValue(createLeanQuery({
      _id: "user-1",
      start_date: "2026-01-01T00:00:00.000Z",
      end_date: null,
      weekly_hours: 40,
      work_schedule: {
        mon: { from: "08:00", to: "16:00", active: true },
        tue: { from: "08:00", to: "16:00", active: true },
        wed: { from: "08:00", to: "16:00", active: true },
        thu: { from: "08:00", to: "16:00", active: true },
        fri: { from: "08:00", to: "16:00", active: true },
        sat: { from: "08:00", to: "16:00", active: false },
        sun: { from: "08:00", to: "16:00", active: false },
      },
      vacation_days_per_year: 2,
    }));

    workScheduleFindOneMock.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    holidayFindMock.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });

    workSessionFindMock.mockReturnValue(createLeanQuery([]));
    leaveRequestFindOneMock.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    leaveRequestCreateMock.mockResolvedValue({ _id: "leave-1" });
  });

  it("verhindert ueberschneidende aktive Antraege", async () => {
    leaveRequestFindOneMock.mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue({
        _id: "existing-request",
        status: "pending",
      }),
    });

    await expect(
      createLeaveRequest(
        { id: "user-1" },
        {
          from: "2026-04-27",
          to: "2026-04-28",
          type: "vacation",
          reason: "Kurzurlaub",
        },
      ),
    ).rejects.toMatchObject({
      status: 409,
      message: "Es existiert bereits ein ueberschneidender Antrag",
    });
  });

  it("verhindert Urlaub ueber dem verfuegbaren Anspruch", async () => {
    leaveRequestFindMock.mockReturnValue(createLeanQuery([
      {
        from: "2026-04-20T00:00:00.000Z",
        to: "2026-04-21T00:00:00.000Z",
      },
    ]));

    await expect(
      createLeaveRequest(
        { id: "user-1" },
        {
          from: "2026-04-27",
          to: "2026-04-27",
          type: "vacation",
          reason: "Noch ein Tag",
        },
      ),
    ).rejects.toMatchObject({
      status: 400,
      message: "Urlaubsanspruch fuer den Zeitraum reicht nicht aus",
    });
  });

  it("verhindert Zeitausgleich ohne positive Ueberstunden", async () => {
    leaveRequestFindMock.mockReturnValue(createLeanQuery([]));
    workSessionFindMock.mockReturnValue(createLeanQuery([
      {
        start_time: "2026-04-20T08:00:00.000Z",
        end_time: "2026-04-20T16:00:00.000Z",
        pause: "0:00",
        date_today: "2026-04-20",
      },
    ]));

    await expect(
      createLeaveRequest(
        { id: "user-1" },
        {
          from: "2026-04-21",
          to: "2026-04-21",
          type: "overtime",
          reason: "Zeitausgleich",
        },
      ),
    ).rejects.toMatchObject({
      status: 400,
      message: "Nicht genug Ueberstunden fuer Zeitausgleich vorhanden",
    });
  });
});

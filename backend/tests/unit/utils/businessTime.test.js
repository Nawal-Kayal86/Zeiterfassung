import { describe, expect, it } from "@jest/globals";
import {
  calculateNetWorkMinutes,
  countWorkingDaysInRange,
  getScheduledMinutesForDate,
} from "../../../utils/businessTime.js";

describe("businessTime helpers", () => {
  it("zieht Pausen von der Arbeitszeit ab", () => {
    const minutes = calculateNetWorkMinutes(
      "2026-04-28T08:00:00.000Z",
      "2026-04-28T16:30:00.000Z",
      "0:30",
    );

    expect(minutes).toBe(480);
  });

  it("berechnet Sollzeit aus dem Tagesplan", () => {
    const minutes = getScheduledMinutesForDate(
      new Date("2026-04-27T00:00:00.000Z"),
      {
        mon: { from: "08:00", to: "16:30", active: true },
      },
      40,
    );

    expect(minutes).toBe(510);
  });

  it("zaehlt Urlaubstage nur an echten Arbeitstagen", () => {
    const days = countWorkingDaysInRange({
      startDate: new Date("2026-04-27T00:00:00.000Z"),
      endDate: new Date("2026-05-03T00:00:00.000Z"),
      schedule: {
        mon: { from: "08:00", to: "16:00", active: true },
        tue: { from: "08:00", to: "16:00", active: true },
        wed: { from: "08:00", to: "16:00", active: true },
        thu: { from: "08:00", to: "16:00", active: true },
        fri: { from: "08:00", to: "16:00", active: true },
        sat: { from: "08:00", to: "16:00", active: false },
        sun: { from: "08:00", to: "16:00", active: false },
      },
      weeklyHours: 40,
      holidayDateSet: new Set(["2026-05-01"]),
      employmentStart: null,
      employmentEnd: null,
    });

    expect(days).toBe(4);
  });
});

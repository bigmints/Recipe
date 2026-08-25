import { describe, expect, it } from "vitest";
import { addDays, dateKey, planEntryKey, startOfWeek } from "./useMealPlanner";

describe("meal planner calendar helpers", () => {
  it("starts weeks on Monday and produces stable date keys", () => {
    const sunday = new Date("2026-08-30T12:00:00.000Z");
    const monday = startOfWeek(sunday);
    expect(dateKey(monday)).toBe("2026-08-24");
    expect(dateKey(addDays(monday, 6))).toBe("2026-08-30");
  });

  it("creates collision-safe keys for each date and meal slot", () => {
    expect(planEntryKey("2026-08-24", "breakfast")).toBe("2026-08-24:breakfast");
    expect(planEntryKey("2026-08-24", "dinner")).not.toBe(planEntryKey("2026-08-24", "lunch"));
  });
});

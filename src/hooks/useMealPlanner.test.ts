import { describe, expect, it } from "vitest";
import { addDays, dateKey, movePlanEntry, planEntryKey, startOfWeek } from "./useMealPlanner";

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

  it("moves a meal and swaps an occupied destination without losing either entry", () => {
    const plan = {
      "2026-08-24:dinner": { date: "2026-08-24", slot: "dinner" as const, recipe: { id: "a", name: "A", category: null, area: null, image: null, thumbnail: null } },
      "2026-08-25:lunch": { date: "2026-08-25", slot: "lunch" as const, recipe: { id: "b", name: "B", category: null, area: null, image: null, thumbnail: null } },
    };
    const moved = movePlanEntry(plan, "2026-08-24", "dinner", "2026-08-25", "lunch");
    expect(moved["2026-08-25:lunch"].recipe.id).toBe("a");
    expect(moved["2026-08-24:dinner"].recipe.id).toBe("b");
  });
});

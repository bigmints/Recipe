import { describe, expect, it } from "vitest";
import { formatMoney } from "./storePrices";

describe("public store price helpers", () => {
  it("formats a reported store currency", () => {
    expect(formatMoney(12.5, "USD")).toContain("12.50");
    expect(formatMoney(12.5, "EUR")).toContain("12.50");
  });

  it("falls back safely for an unknown currency code", () => {
    expect(formatMoney(4.25, "BAD")).toBe("BAD 4.25");
  });
});

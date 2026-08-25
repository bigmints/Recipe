import { describe, expect, it } from "vitest";
import { defaultIngredientPrice, estimateGroceryCost } from "./budget";

const items = [
  { key: "pasta", name: "pasta", measures: ["350 g"], recipes: ["Pasta"] },
  { key: "tomato", name: "tomato", measures: ["2"], recipes: ["Pasta"] },
];

describe("grocery budget estimates", () => {
  it("uses ingredient-aware default prices", () => {
    expect(defaultIngredientPrice("pasta")).toBe(2.5);
    expect(defaultIngredientPrice("unknown pantry item")).toBe(3.25);
  });

  it("applies editable overrides to the missing-item total", () => {
    expect(estimateGroceryCost(items)).toBe(5.25);
    expect(estimateGroceryCost(items, { pasta: 4, tomato: 1 })).toBe(5);
  });
});

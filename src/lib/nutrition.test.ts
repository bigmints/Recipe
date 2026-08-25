import { describe, expect, it } from "vitest";
import { aggregateDailyNutrition, estimateRecipeNutrition } from "./nutrition";

const recipe = {
  id: "1", name: "Pasta Bowl", category: "Pasta", area: "Italian", image: null, thumbnail: null,
  instructions: null, youtube: null, source: null, tags: [],
  ingredients: [
    { name: "pasta", measure: "200g", image: "" },
    { name: "chicken", measure: "1 breast", image: "" },
    { name: "tomato", measure: "2", image: "" },
  ],
};

describe("nutrition estimates", () => {
  it("returns positive calories and macro values for a recipe", () => {
    const totals = estimateRecipeNutrition(recipe);
    expect(totals.calories).toBeGreaterThan(0);
    expect(totals.protein).toBeGreaterThan(0);
    expect(totals.carbs).toBeGreaterThan(0);
    expect(totals.fat).toBeGreaterThan(0);
  });

  it("aggregates meals by date", () => {
    const entries = [
      { date: "2026-08-24", slot: "lunch" as const, recipe: { id: "1", name: recipe.name, category: recipe.category, area: recipe.area, image: null, thumbnail: null } },
      { date: "2026-08-24", slot: "dinner" as const, recipe: { id: "1", name: recipe.name, category: recipe.category, area: recipe.area, image: null, thumbnail: null } },
    ];
    const totals = aggregateDailyNutrition(entries, { "1": recipe });
    expect(totals["2026-08-24"].calories).toBe(estimateRecipeNutrition(recipe).calories * 2);
  });
});

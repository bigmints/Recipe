import { describe, expect, it } from "vitest";
import { aggregateIngredients } from "./grocery";

const entries = [
  { date: "2026-08-24", slot: "dinner" as const, recipe: { id: "1", name: "Lemon Pasta", category: "Pasta", area: "Italian", image: null, thumbnail: null } },
  { date: "2026-08-25", slot: "lunch" as const, recipe: { id: "2", name: "Garden Salad", category: "Vegetarian", area: "American", image: null, thumbnail: null } },
];

describe("aggregateIngredients", () => {
  it("merges repeated ingredients and keeps measures and recipe attribution", () => {
    const result = aggregateIngredients(entries, {
      "1": { ...entries[0].recipe, instructions: null, youtube: null, source: null, tags: [], ingredients: [{ name: "Tomato", measure: "2", image: "" }, { name: "Pasta", measure: "200g", image: "" }] },
      "2": { ...entries[1].recipe, instructions: null, youtube: null, source: null, tags: [], ingredients: [{ name: "tomato", measure: "1", image: "" }, { name: "Lettuce", measure: "1 head", image: "" }] },
    });

    expect(result.map((item) => item.name)).toEqual(["Lettuce", "Pasta", "Tomato"]);
    expect(result.find((item) => item.key === "tomato")).toMatchObject({ measures: ["2", "1"], recipes: ["Lemon Pasta", "Garden Salad"] });
  });
});

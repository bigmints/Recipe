import { describe, expect, it } from "vitest";
import { rankPantryRecipes } from "./recommendations";

const recipe = (id: string, name: string, ingredients: string[]) => ({
  id, name, category: null, area: null, image: null, thumbnail: null,
  instructions: null, youtube: null, source: null, tags: [],
  ingredients: ingredients.map((ingredient) => ({ name: ingredient, measure: "1", image: "" })),
});

describe("rankPantryRecipes", () => {
  it("ranks recipes by pantry matches and reports missing ingredients", () => {
    const result = rankPantryRecipes([
      recipe("1", "Tomato Pasta", ["tomato", "pasta", "basil"]),
      recipe("2", "Chicken Bowl", ["chicken", "rice"]),
    ], ["tomato", "pasta"]);

    expect(result[0].recipe.name).toBe("Tomato Pasta");
    expect(result[0].matchedIngredients).toEqual(["tomato", "pasta"]);
    expect(result[0].missingIngredients).toEqual(["basil"]);
  });

  it("does not recommend recipes with no pantry overlap", () => {
    expect(rankPantryRecipes([recipe("1", "Soup", ["carrot", "onion"])], ["pasta"])).toEqual([]);
  });
});

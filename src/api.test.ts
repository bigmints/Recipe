import { describe, expect, it } from "vitest";
import { normalizeDetail, normalizeSummary } from "./api";

const summary = {
  idMeal: "123",
  strMeal: "  Lemon pasta ",
  strCategory: "Pasta",
  strArea: "Italian",
  strMealThumb: "https://example.com/pasta.jpg",
};

describe("recipe normalization", () => {
  it("normalizes a meal summary into the internal recipe shape", () => {
    expect(normalizeSummary(summary)).toEqual({
      id: "123",
      name: "  Lemon pasta ",
      category: "Pasta",
      area: "Italian",
      image: "https://example.com/pasta.jpg",
      thumbnail: "https://example.com/pasta.jpg",
    });
  });

  it("collects only populated ingredients and preserves recipe metadata", () => {
    const detail = {
      ...summary,
      strInstructions: "Boil pasta. Toss with lemon.",
      strYoutube: "https://youtube.com/watch?v=demo",
      strSource: "https://example.com/source",
      strTags: "Quick, Fresh",
      strIngredient1: "Pasta",
      strMeasure1: "200g",
      strIngredient2: "Lemon",
      strMeasure2: "1",
      strIngredient3: "",
      strMeasure3: "",
    };

    expect(normalizeDetail(detail)).toMatchObject({
      id: "123",
      instructions: "Boil pasta. Toss with lemon.",
      tags: ["Quick", "Fresh"],
      ingredients: [
        { name: "Pasta", measure: "200g" },
        { name: "Lemon", measure: "1" },
      ],
    });
    expect(normalizeDetail(detail).ingredients).toHaveLength(2);
  });
});

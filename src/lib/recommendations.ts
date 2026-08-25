import type { Recipe, RecipeSummary } from "../types";

export type RecipeRecommendation = {
  recipe: RecipeSummary;
  matchedIngredients: string[];
  missingIngredients: string[];
  score: number;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function rankPantryRecipes(recipes: Recipe[], pantryKeys: string[], limit = 6): RecipeRecommendation[] {
  const pantry = pantryKeys.map(normalize).filter(Boolean);
  return recipes
    .map((recipe) => {
      const matchedIngredients = recipe.ingredients.filter((ingredient) => pantry.some((key) => normalize(ingredient.name).includes(key) || key.includes(normalize(ingredient.name)))).map((ingredient) => ingredient.name);
      const missingIngredients = recipe.ingredients.filter((ingredient) => !matchedIngredients.includes(ingredient.name)).map((ingredient) => ingredient.name);
      const score = matchedIngredients.length * 3 - missingIngredients.length;
      return { recipe, matchedIngredients, missingIngredients, score };
    })
    .filter((recommendation) => recommendation.matchedIngredients.length > 0)
    .sort((a, b) => b.score - a.score || b.matchedIngredients.length - a.matchedIngredients.length || a.recipe.name.localeCompare(b.recipe.name))
    .slice(0, limit)
    .map((recommendation) => ({ ...recommendation, recipe: { ...recommendation.recipe } }));
}

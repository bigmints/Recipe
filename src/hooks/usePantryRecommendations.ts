import { useEffect, useState } from "react";
import { filterRecipes, getRecipe } from "../api";
import { rankPantryRecipes, type RecipeRecommendation } from "../lib/recommendations";

export function usePantryRecommendations(pantryKeys: string[]) {
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pantrySignature = pantryKeys.join("|");

  useEffect(() => {
    if (!pantrySignature) {
      setRecommendations([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const ingredients = pantrySignature.split("|").filter(Boolean);
    setLoading(true);
    setError(null);

    Promise.all(ingredients.map((ingredient) => filterRecipes({ ingredient: ingredient.replace(/ /g, "_") }, controller.signal).catch(() => [])))
      .then(async (summaryGroups) => {
        const uniqueSummaries = [...new Map(summaryGroups.flat().map((recipe) => [recipe.id, recipe])).values()].slice(0, 18);
        const details = await Promise.all(uniqueSummaries.map((summary) => getRecipe(summary.id, controller.signal).catch(() => null)));
        if (!controller.signal.aborted) setRecommendations(rankPantryRecipes(details.filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe)), ingredients));
      })
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "We could not find pantry recommendations."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [pantrySignature]);

  return { recommendations, loading, error };
}

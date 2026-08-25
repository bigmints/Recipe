import { useCallback, useEffect, useRef, useState } from "react";
import { filterRecipes, RecipeApiError, searchRecipes } from "../api";
import type { RecipeFilters, RecipeSummary } from "../types";

export type SearchStatus = "idle" | "loading" | "success" | "error";

function applyLocalFilters(results: RecipeSummary[], filters: RecipeFilters) {
  return results.filter((recipe) => {
    const categoryMatches = !filters.category || recipe.category === filters.category;
    const areaMatches = !filters.area || recipe.area === filters.area;
    return categoryMatches && areaMatches;
  });
}

export function useRecipeSearch(initialQuery = "", initialFilters: RecipeFilters = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);
  const [results, setResults] = useState<RecipeSummary[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const executeSearch = useCallback(async (nextQuery = query, nextFilters = filters) => {
    const normalized = nextQuery.trim();
    requestRef.current?.abort();

    if (!normalized && !nextFilters.category && !nextFilters.area && !nextFilters.ingredient) {
      setResults([]);
      setStatus("idle");
      setError(null);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("loading");
    setError(null);

    try {
      const rawResults = normalized
        ? await searchRecipes({ query: normalized }, controller.signal)
        : await filterRecipes(nextFilters, controller.signal);
      const nextResults = applyLocalFilters(rawResults, nextFilters);
      if (!controller.signal.aborted) {
        setResults(nextResults);
        setStatus("success");
        const params = new URLSearchParams();
        if (normalized) params.set("q", normalized);
        Object.entries(nextFilters).forEach(([key, value]) => { if (value) params.set(key, value); });
        window.history.replaceState(null, "", params.toString() ? `?${params.toString()}` : window.location.pathname);
      }
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setError(requestError instanceof RecipeApiError ? requestError.message : "Something went wrong. Please try again.");
    }
  }, [filters, query]);

  useEffect(() => () => requestRef.current?.abort(), []);

  return { query, setQuery, filters, setFilters, results, status, error, executeSearch };
}

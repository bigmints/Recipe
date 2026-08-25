import { useCallback, useEffect, useRef, useState } from "react";
import { RecipeApiError, searchRecipes } from "../api";
import type { RecipeSummary } from "../types";

export type SearchStatus = "idle" | "loading" | "success" | "error";

export function useRecipeSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<RecipeSummary[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const executeSearch = useCallback(async (nextQuery = query) => {
    const normalized = nextQuery.trim();
    requestRef.current?.abort();

    if (!normalized) {
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("loading");
    setError(null);

    try {
      const nextResults = await searchRecipes({ query: normalized }, controller.signal);
      if (!controller.signal.aborted) {
        setResults(nextResults);
        setStatus("success");
        window.history.replaceState(null, "", `?q=${encodeURIComponent(normalized)}`);
      }
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setError(requestError instanceof RecipeApiError ? requestError.message : "Something went wrong. Please try again.");
    }
  }, [query]);

  useEffect(() => () => requestRef.current?.abort(), []);

  return { query, setQuery, results, status, error, executeSearch };
}

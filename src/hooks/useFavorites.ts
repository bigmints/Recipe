import { useCallback, useEffect, useState } from "react";
import type { RecipeSummary } from "../types";

const STORAGE_KEY = "pantry-favorites";

function readFavorites(): Record<string, RecipeSummary> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed).filter(([, value]) => value && typeof value === "object") as Array<[string, RecipeSummary]>;
    return Object.fromEntries(entries) as Record<string, RecipeSummary>;
  } catch {
    return {};
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Record<string, RecipeSummary>>(() => readFavorites());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)); } catch { /* Storage can be unavailable in private browsing. */ }
  }, [favorites]);

  const toggleFavorite = useCallback((recipe: RecipeSummary) => {
    setFavorites((current) => {
      const next = { ...current };
      if (next[recipe.id]) delete next[recipe.id];
      else next[recipe.id] = recipe;
      return next;
    });
  }, []);

  return { favorites, favoriteRecipes: Object.values(favorites), toggleFavorite };
}

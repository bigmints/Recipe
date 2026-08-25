import { useEffect, useMemo, useState } from "react";
import { getRecipe } from "../api";
import type { MealPlanEntry, Recipe } from "../types";

export function usePlannerDetails(entries: MealPlanEntry[]) {
  const uniqueIds = useMemo(() => [...new Set(entries.map((entry) => entry.recipe.id))], [entries]);
  const [details, setDetails] = useState<Record<string, Recipe>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const missingIds = uniqueIds.filter((id) => !details[id]);
    if (missingIds.length === 0) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    Promise.all(missingIds.map(async (id) => [id, await getRecipe(id, controller.signal)] as const))
      .then((loaded) => setDetails((current) => ({ ...current, ...Object.fromEntries(loaded) })))
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "We could not load the planner details."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [details, uniqueIds]);

  return { details, loading, error };
}

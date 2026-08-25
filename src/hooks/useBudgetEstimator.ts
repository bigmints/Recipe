import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pantry-budget-prices";

function readOverrides(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === "number" && Number.isFinite(value) && value >= 0)) as Record<string, number>;
  } catch {
    return {};
  }
}

export function useBudgetEstimator() {
  const [overrides, setOverrides] = useState<Record<string, number>>(() => readOverrides());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); } catch { /* Storage can be unavailable. */ }
  }, [overrides]);

  const setPrice = useCallback((key: string, value: number) => {
    setOverrides((current) => ({ ...current, [key]: Math.max(0, value) }));
  }, []);
  const resetPrices = useCallback(() => setOverrides({}), []);

  return { overrides, setPrice, resetPrices };
}

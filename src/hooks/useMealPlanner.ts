import { useCallback, useEffect, useMemo, useState } from "react";
import type { MealPlanEntry, MealSlot, RecipeSummary } from "../types";

const STORAGE_KEY = "pantry-meal-plan";

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(date: Date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  const day = copy.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + offset);
  return copy;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function readPlan(): Record<string, MealPlanEntry> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed).filter(([, value]) => {
      if (!value || typeof value !== "object") return false;
      const entry = value as Partial<MealPlanEntry>;
      return typeof entry.date === "string" && typeof entry.slot === "string" && Boolean(entry.recipe?.id);
    }) as Array<[string, MealPlanEntry]>;
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

export function planEntryKey(date: string, slot: MealSlot) {
  return `${date}:${slot}`;
}

export function useMealPlanner() {
  const [plan, setPlan] = useState<Record<string, MealPlanEntry>>(() => readPlan());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); } catch { /* Storage can be unavailable in private browsing. */ }
  }, [plan]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const entries = useMemo(() => Object.values(plan), [plan]);

  const scheduleMeal = useCallback((date: string, slot: MealSlot, recipe: RecipeSummary) => {
    setPlan((current) => ({ ...current, [planEntryKey(date, slot)]: { date, slot, recipe } }));
  }, []);

  const removeMeal = useCallback((date: string, slot: MealSlot) => {
    setPlan((current) => {
      const next = { ...current };
      delete next[planEntryKey(date, slot)];
      return next;
    });
  }, []);

  const getMeal = useCallback((date: string, slot: MealSlot) => plan[planEntryKey(date, slot)], [plan]);

  return {
    plan,
    entries,
    weekStart,
    weekDays,
    setWeekStart,
    scheduleMeal,
    removeMeal,
    getMeal,
    goToPreviousWeek: () => setWeekStart((current) => addDays(current, -7)),
    goToNextWeek: () => setWeekStart((current) => addDays(current, 7)),
    goToCurrentWeek: () => setWeekStart(startOfWeek(new Date())),
    hasCurrentWeekEntries: weekDays.some((day) => ["breakfast", "lunch", "dinner"].some((slot) => Boolean(plan[planEntryKey(dateKey(day), slot as MealSlot)]))),
  };
}

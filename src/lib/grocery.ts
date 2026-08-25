import type { MealPlanEntry, Recipe } from "../types";

export type GroceryItem = {
  key: string;
  name: string;
  measures: string[];
  recipes: string[];
};

function normalizeIngredient(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function cleanMeasure(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function aggregateIngredients(entries: MealPlanEntry[], details: Record<string, Recipe>): GroceryItem[] {
  const grouped = new Map<string, GroceryItem>();
  entries.forEach((entry) => {
    const detail = details[entry.recipe.id];
    detail?.ingredients.forEach((ingredient) => {
      const key = normalizeIngredient(ingredient.name);
      if (!key) return;
      const existing = grouped.get(key);
      const measure = cleanMeasure(ingredient.measure);
      if (existing) {
        if (measure && !existing.measures.includes(measure)) existing.measures.push(measure);
        if (!existing.recipes.includes(entry.recipe.name)) existing.recipes.push(entry.recipe.name);
      } else {
        grouped.set(key, { key, name: ingredient.name.trim(), measures: measure ? [measure] : [], recipes: [entry.recipe.name] });
      }
    });
  });
  return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
}

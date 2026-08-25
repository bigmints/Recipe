import type { MealPlanEntry, NutritionTotals, Recipe } from "../types";

const zero: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
const profiles: Array<{ matches: string[]; values: NutritionTotals }> = [
  { matches: ["chicken", "turkey", "beef", "steak", "pork", "lamb", "tuna", "salmon", "fish", "shrimp"], values: { calories: 210, protein: 29, carbs: 0, fat: 9 } },
  { matches: ["pasta", "farfalle", "spaghetti", "noodle", "rice", "bread", "flour", "couscous"], values: { calories: 230, protein: 7, carbs: 45, fat: 2 } },
  { matches: ["cheese", "mozzarella", "parmesan", "cheddar", "cream"], values: { calories: 110, protein: 6, carbs: 3, fat: 8 } },
  { matches: ["oil", "butter", "mayo", "mayonnaise"], values: { calories: 120, protein: 0, carbs: 0, fat: 14 } },
  { matches: ["bean", "lentil", "chickpea", "tofu"], values: { calories: 150, protein: 9, carbs: 24, fat: 2 } },
  { matches: ["egg"], values: { calories: 80, protein: 6, carbs: 1, fat: 5 } },
  { matches: ["tomato", "lettuce", "spinach", "carrot", "onion", "pepper", "broccoli", "cucumber", "zucchini", "mushroom", "basil", "herb", "garlic"], values: { calories: 38, protein: 2, carbs: 7, fat: 0 } },
  { matches: ["apple", "banana", "berry", "lemon", "lime", "orange", "mango"], values: { calories: 65, protein: 1, carbs: 16, fat: 0 } },
];

function add(left: NutritionTotals, right: NutritionTotals): NutritionTotals {
  return { calories: left.calories + right.calories, protein: left.protein + right.protein, carbs: left.carbs + right.carbs, fat: left.fat + right.fat };
}

export function estimateRecipeNutrition(recipe: Recipe): NutritionTotals {
  const ingredientTotals = recipe.ingredients.reduce((total, ingredient) => {
    const name = ingredient.name.toLowerCase();
    const profile = profiles.find((item) => item.matches.some((match) => name.includes(match)));
    return add(total, profile?.values ?? { calories: 42, protein: 1, carbs: 7, fat: 1 });
  }, zero);
  const estimated = ingredientTotals.calories > 0 ? ingredientTotals : { calories: 280, protein: 10, carbs: 35, fat: 10 };
  return {
    calories: Math.max(220, Math.round(estimated.calories * 0.72)),
    protein: Math.max(4, Math.round(estimated.protein * 0.72)),
    carbs: Math.max(8, Math.round(estimated.carbs * 0.72)),
    fat: Math.max(3, Math.round(estimated.fat * 0.72)),
  };
}

export function aggregateDailyNutrition(entries: MealPlanEntry[], details: Record<string, Recipe>): Record<string, NutritionTotals> {
  return entries.reduce<Record<string, NutritionTotals>>((totals, entry) => {
    const detail = details[entry.recipe.id];
    if (!detail) return totals;
    const current = totals[entry.date] ?? { ...zero };
    totals[entry.date] = add(current, estimateRecipeNutrition(detail));
    return totals;
  }, {});
}

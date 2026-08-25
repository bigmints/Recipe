import type { GroceryItem } from "./grocery";

const priceRules: Array<{ matches: string[]; price: number }> = [
  { matches: ["chicken", "beef", "steak", "pork", "lamb", "tuna", "salmon", "fish", "shrimp"], price: 6.5 },
  { matches: ["cheese", "mozzarella", "parmesan", "cheddar", "cream", "milk", "yogurt", "butter"], price: 4.5 },
  { matches: ["oil", "vinegar", "sauce", "soy", "mayo", "mayonnaise"], price: 4.75 },
  { matches: ["pasta", "farfalle", "spaghetti", "noodle", "rice", "bread", "flour", "couscous"], price: 2.5 },
  { matches: ["salt", "pepper", "basil", "herb", "garlic", "spice"], price: 2.25 },
  { matches: ["tomato", "lettuce", "spinach", "carrot", "onion", "pepper", "broccoli", "cucumber", "zucchini", "mushroom", "lemon", "lime", "apple", "banana", "berry", "orange", "mango"], price: 2.75 },
];

export function defaultIngredientPrice(name: string) {
  const normalized = name.toLowerCase();
  return priceRules.find((rule) => rule.matches.some((match) => normalized.includes(match)))?.price ?? 3.25;
}

export function estimateGroceryCost(items: GroceryItem[], overrides: Record<string, number> = {}) {
  return items.reduce((total, item) => total + (overrides[item.key] ?? defaultIngredientPrice(item.name)), 0);
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

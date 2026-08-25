export type RecipeSummary = {
  id: string;
  name: string;
  category: string | null;
  area: string | null;
  image: string | null;
  thumbnail: string | null;
};

export type RecipeIngredient = {
  name: string;
  measure: string;
  image: string;
};

export type Recipe = RecipeSummary & {
  instructions: string | null;
  youtube: string | null;
  source: string | null;
  tags: string[];
  ingredients: RecipeIngredient[];
};

export type RecipeFilters = {
  category?: string;
  area?: string;
  ingredient?: string;
};

export type RecipeQuery = RecipeFilters & {
  query?: string;
};

export type MealDbSummary = {
  idMeal: string;
  strMeal: string;
  strCategory?: string | null;
  strArea?: string | null;
  strMealThumb?: string | null;
};

export type MealDbDetail = MealDbSummary & {
  strInstructions?: string | null;
  strYoutube?: string | null;
  strSource?: string | null;
  strTags?: string | null;
  [key: `strIngredient${number}`]: string | null | undefined;
  [key: `strMeasure${number}`]: string | null | undefined;
};

export type MealDbResponse = {
  meals: MealDbSummary[] | MealDbDetail[] | null;
};

export type RecipeOption = {
  value: string;
  label: string;
};

export type MealSlot = "breakfast" | "lunch" | "dinner";

export type MealPlanEntry = {
  date: string;
  slot: MealSlot;
  recipe: RecipeSummary;
};

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

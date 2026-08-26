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

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type NearbyStore = {
  id: string;
  name: string;
  address: string | null;
  distanceKm: number | null;
  latitude: number | null;
  longitude: number | null;
  priceCount: number;
  productCount: number;
  source: "Open Prices" | "OpenStreetMap";
};

export type LiveStorePrice = {
  id: string;
  ingredientKey: string;
  ingredientName: string;
  storeId: string;
  storeName: string;
  productName: string | null;
  price: number;
  currency: string;
  observedOn: string | null;
  source: string;
};

export type StoreComparison = {
  store: NearbyStore;
  prices: LiveStorePrice[];
  total: number;
  coveredItems: number;
  missingItems: number;
};

import type {
  MealDbDetail,
  MealDbResponse,
  MealDbSummary,
  Recipe,
  RecipeIngredient,
  RecipeOption,
  RecipeQuery,
  RecipeSummary,
} from "./types";

const API_BASE = "https://www.themealdb.com/api/json/v1/1";
const REQUEST_TIMEOUT_MS = 10_000;

export class RecipeApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "RecipeApiError";
  }
}

function clean(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function normalizeSummary(meal: MealDbSummary): RecipeSummary {
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: clean(meal.strCategory),
    area: clean(meal.strArea),
    image: clean(meal.strMealThumb),
    thumbnail: clean(meal.strMealThumb),
  };
}

export function normalizeDetail(meal: MealDbDetail): Recipe {
  const ingredients: RecipeIngredient[] = [];

  for (let index = 1; index <= 20; index += 1) {
    const name = clean(meal[`strIngredient${index}`]);
    const measure = clean(meal[`strMeasure${index}`]);
    if (name) {
      const imageName = name.toLowerCase().replace(/ /g, "_");
      ingredients.push({
        name,
        measure: measure ?? "To taste",
        image: `https://www.themealdb.com/images/ingredients/${imageName}-small.png`,
      });
    }
  }

  return {
    ...normalizeSummary(meal),
    instructions: clean(meal.strInstructions),
    youtube: clean(meal.strYoutube),
    source: clean(meal.strSource),
    tags: meal.strTags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
    ingredients,
  };
}

async function request<T extends MealDbResponse>(path: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw new RecipeApiError(`The recipe service returned ${response.status}.`, response.status);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof RecipeApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new RecipeApiError("The request took too long. Please try again.");
    }
    throw new RecipeApiError("We could not reach the recipe service. Please try again.");
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

export async function searchRecipes(query: RecipeQuery, signal?: AbortSignal): Promise<RecipeSummary[]> {
  const params = new URLSearchParams();
  const term = query.query?.trim();
  if (term) params.set("s", term);
  else if (query.ingredient) params.set("i", query.ingredient);
  else if (query.category) params.set("c", query.category);
  else if (query.area) params.set("a", query.area);
  else params.set("f", "a");

  const response = await request<MealDbResponse>(`/${term || query.ingredient || query.category || query.area ? "search.php" : "search.php"}?${params.toString()}`, signal);
  const meals = (response.meals ?? []) as MealDbSummary[];
  return meals.map(normalizeSummary);
}

export async function filterRecipes(filters: RecipeQuery, signal?: AbortSignal): Promise<RecipeSummary[]> {
  const params = new URLSearchParams();
  if (filters.ingredient) params.set("i", filters.ingredient);
  else if (filters.category) params.set("c", filters.category);
  else if (filters.area) params.set("a", filters.area);
  else return searchRecipes(filters, signal);

  const response = await request<MealDbResponse>(`/filter.php?${params.toString()}`, signal);
  const meals = (response.meals ?? []) as MealDbSummary[];
  return meals.map(normalizeSummary);
}

export async function getRecipe(id: string, signal?: AbortSignal): Promise<Recipe> {
  const response = await request<MealDbResponse>(`/lookup.php?i=${encodeURIComponent(id)}`, signal);
  const meal = response.meals?.[0] as MealDbDetail | undefined;
  if (!meal) throw new RecipeApiError("That recipe is no longer available.");
  return normalizeDetail(meal);
}

async function listOptions(path: string, key: "strCategory" | "strArea" | "strIngredient", signal?: AbortSignal): Promise<RecipeOption[]> {
  const response = await request<MealDbResponse>(path, signal);
  const items = (response.meals ?? []) as Array<Record<string, string | null>>;
  return items
    .map((item) => clean(item[key]))
    .filter((label): label is string => Boolean(label))
    .map((label) => ({ value: label, label }));
}

export function getCategories(signal?: AbortSignal) {
  return listOptions("/list.php?c=list", "strCategory", signal);
}

export function getAreas(signal?: AbortSignal) {
  return listOptions("/list.php?a=list", "strArea", signal);
}

export function getIngredients(signal?: AbortSignal) {
  return listOptions("/list.php?i=list", "strIngredient", signal);
}

import type { GroceryItem } from "./grocery";
import type { NearbyStore, StoreComparison, UserLocation, LiveStorePrice } from "../types";

const OPEN_PRICES_BASE = "https://prices.openfoodfacts.org/api/v1";
const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

type JsonRecord = Record<string, unknown>;

type NearbyResponse = { items?: JsonRecord[] };
type PriceResponse = { items?: JsonRecord[] };

type OverpassResponse = { elements?: Array<{ id: number; type: string; lat?: number; lon?: number; center?: { lat?: number; lon?: number }; tags?: JsonRecord }> };

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toStore(item: JsonRecord, source: NearbyStore["source"]): NearbyStore | null {
  const id = String(item.id ?? item.osm_id ?? "");
  const name = stringValue(item.osm_name) ?? stringValue(item.osm_brand) ?? stringValue(item.name);
  if (!id || !name) return null;
  const latitude = numberValue(item.osm_lat) ?? numberValue(item.lat);
  const longitude = numberValue(item.osm_lon) ?? numberValue(item.lon);
  const parts = [item.osm_address_postcode, item.osm_address_city, item.address].map(stringValue).filter((value): value is string => Boolean(value));
  return {
    id,
    name,
    address: stringValue(item.osm_display_name) ?? (parts.length > 0 ? parts.join(", ") : null),
    distanceKm: numberValue(item.distance_km),
    latitude,
    longitude,
    priceCount: numberValue(item.price_count) ?? 0,
    productCount: numberValue(item.product_count) ?? 0,
    source,
  };
}

function distanceKm(a: UserLocation, latitude: number, longitude: number) {
  const radians = Math.PI / 180;
  const dLat = (latitude - a.latitude) * radians;
  const dLon = (longitude - a.longitude) * radians;
  const lat1 = a.latitude * radians;
  const lat2 = latitude * radians;
  const value = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Public price service returned ${response.status}.`);
  return response.json() as Promise<T>;
}

export async function discoverNearbyStores(location: UserLocation, signal?: AbortSignal): Promise<NearbyStore[]> {
  try {
    const params = new URLSearchParams({ lat: String(location.latitude), lon: String(location.longitude), radius_km: "25", size: "12" });
    const response = await fetchJson<NearbyResponse>(`${OPEN_PRICES_BASE}/locations/nearby?${params}`, signal);
    const stores = (response.items ?? []).map((item) => toStore(item, "Open Prices")).filter((store): store is NearbyStore => Boolean(store));
    if (stores.length > 0) return stores;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
  }

  const query = `[out:json][timeout:20];nwr["shop"="supermarket"](around:25000,${location.latitude},${location.longitude});out center tags;`;
  const response = await fetchJson<OverpassResponse>(`${OVERPASS_ENDPOINT}?data=${encodeURIComponent(query)}`, signal);
  return (response.elements ?? []).map((element) => {
    const latitude = element.lat ?? element.center?.lat ?? null;
    const longitude = element.lon ?? element.center?.lon ?? null;
    const tags = element.tags ?? {};
    if (latitude === null || longitude === null) return null;
    return toStore({ id: `${element.type}-${element.id}`, name: tags.name, address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(" "), lat: latitude, lon: longitude, distance_km: distanceKm(location, latitude, longitude) }, "OpenStreetMap");
  }).filter((store): store is NearbyStore => Boolean(store)).sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)).slice(0, 12);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesIngredient(productName: string, ingredient: GroceryItem) {
  const product = normalize(productName);
  const tokens = normalize(ingredient.name).split(" ").filter((token) => token.length > 2);
  return tokens.some((token) => product.includes(token)) || product.includes(normalize(ingredient.name));
}

function parsePrice(item: JsonRecord, store: NearbyStore, ingredients: GroceryItem[]): LiveStorePrice | null {
  const price = numberValue(item.price);
  const nestedProduct = item.product && typeof item.product === "object" ? item.product as JsonRecord : null;
  const productName = stringValue(item.product_name) ?? stringValue(nestedProduct?.product_name);
  const currency = stringValue(item.currency);
  if (price === null || price < 0 || !productName || !currency) return null;
  const ingredient = ingredients.find((candidate) => matchesIngredient(productName, candidate));
  if (!ingredient) return null;
  return {
    id: String(item.id ?? `${store.id}-${ingredient.key}`),
    ingredientKey: ingredient.key,
    ingredientName: ingredient.name,
    storeId: store.id,
    storeName: store.name,
    productName,
    price,
    currency,
    observedOn: stringValue(item.date),
    source: "Open Prices community observation",
  };
}

export async function compareNearbyStorePrices(stores: NearbyStore[], ingredients: GroceryItem[], signal?: AbortSignal): Promise<StoreComparison[]> {
  const eligibleStores = stores.filter((store) => store.source === "Open Prices" && store.priceCount > 0).slice(0, 6);
  const comparisons = await Promise.all(eligibleStores.map(async (store) => {
    try {
      const params = new URLSearchParams({ location_id: store.id, size: "250", page: "1" });
      const response = await fetchJson<PriceResponse>(`${OPEN_PRICES_BASE}/prices?${params}`, signal);
      const prices = (response.items ?? []).map((item) => parsePrice(item, store, ingredients)).filter((price): price is LiveStorePrice => Boolean(price));
      const bestByIngredient = new Map<string, LiveStorePrice>();
      for (const price of prices) {
        const existing = bestByIngredient.get(price.ingredientKey);
        if (!existing || price.price < existing.price) bestByIngredient.set(price.ingredientKey, price);
      }
      const selected = [...bestByIngredient.values()];
      return { store, prices: selected, total: selected.reduce((sum, price) => sum + price.price, 0), coveredItems: selected.length, missingItems: Math.max(0, ingredients.length - selected.length) } satisfies StoreComparison;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      return { store, prices: [], total: 0, coveredItems: 0, missingItems: ingredients.length } satisfies StoreComparison;
    }
  }));
  return comparisons.filter((comparison) => comparison.coveredItems > 0).sort((a, b) => a.total - b.total);
}

export function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value).replace(/\u00a0/g, " ");
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

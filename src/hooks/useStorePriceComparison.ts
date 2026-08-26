import { useEffect, useState } from "react";
import type { NearbyStore, StoreComparison, UserLocation } from "../types";
import type { GroceryItem } from "../lib/grocery";
import { compareNearbyStorePrices, discoverNearbyStores } from "../lib/storePrices";

type ComparisonState = {
  stores: NearbyStore[];
  comparisons: StoreComparison[];
  loading: boolean;
  error: string | null;
};

export function useStorePriceComparison(items: GroceryItem[], location: UserLocation | null) {
  const [state, setState] = useState<ComparisonState>({ stores: [], comparisons: [], loading: false, error: null });

  useEffect(() => {
    if (!location || items.length === 0) {
      setState((current) => ({ ...current, stores: [], comparisons: [], loading: false, error: null }));
      return;
    }

    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: null }));
    void (async () => {
      try {
        const stores = await discoverNearbyStores(location, controller.signal);
        const comparisons = await compareNearbyStorePrices(stores, items, controller.signal);
        if (!controller.signal.aborted) setState({ stores, comparisons, loading: false, error: null });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) setState({ stores: [], comparisons: [], loading: false, error: "Nearby store prices are unavailable right now. Your editable estimates are still available." });
      }
    })();

    return () => controller.abort();
  }, [items, location]);

  return state;
}

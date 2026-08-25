import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pantry-inventory";

function readInventory(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function toggleInventoryKey(current: string[], key: string) {
  return current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
}

export function usePantryInventory() {
  const [inventory, setInventory] = useState<string[]>(() => readInventory());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory)); } catch { /* Storage can be unavailable. */ }
  }, [inventory]);

  const hasItem = useCallback((key: string) => inventory.includes(key), [inventory]);
  const toggleItem = useCallback((key: string) => {
    setInventory((current) => toggleInventoryKey(current, key));
  }, []);
  const clearInventory = useCallback(() => setInventory([]), []);

  return { inventory, hasItem, toggleItem, clearInventory };
}

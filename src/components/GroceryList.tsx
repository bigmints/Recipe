import { useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle, RotateCcw, ShoppingBasket } from "lucide-react";
import { aggregateIngredients } from "../lib/grocery";
import { usePlannerDetails } from "../hooks/usePlannerDetails";
import { usePantryInventory } from "../hooks/usePantryInventory";
import type { MealPlanEntry } from "../types";

const CHECKED_STORAGE_KEY = "pantry-grocery-checked";

type GroceryListProps = { entries: MealPlanEntry[] };

function readChecked() {
  try {
    const value = JSON.parse(localStorage.getItem(CHECKED_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function GroceryList({ entries }: GroceryListProps) {
  const { details, loading, error } = usePlannerDetails(entries);
  const { inventory, hasItem, toggleItem, clearInventory } = usePantryInventory();
  const [checked, setChecked] = useState<string[]>(() => readChecked());
  const items = useMemo(() => aggregateIngredients(entries, details), [details, entries]);
  const shoppingItems = useMemo(() => items.filter((item) => !hasItem(item.key)), [hasItem, items]);
  const pantryItems = useMemo(() => items.filter((item) => hasItem(item.key)), [hasItem, items]);

  useEffect(() => {
    try { localStorage.setItem(CHECKED_STORAGE_KEY, JSON.stringify(checked)); } catch { /* Storage can be unavailable. */ }
  }, [checked]);

  function toggleChecked(key: string) { setChecked((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]); }
  function resetChecked() { setChecked([]); }

  return <section className="grocery-section" aria-labelledby="grocery-title">
    <div className="grocery-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> Everything in one place</p><h2 id="grocery-title">Shopping <em>list.</em></h2></div><div className="grocery-summary"><span>{shoppingItems.length} to buy · {pantryItems.length} on hand</span>{checked.length > 0 && <button type="button" onClick={resetChecked}><RotateCcw size={13} /> Reset checked</button>}</div></div>
    {loading && <div className="grocery-state"><LoaderCircle className="spin" size={22} /><p>Gathering ingredients from your plan…</p></div>}
    {!loading && error && <div className="grocery-state grocery-error"><p>{error}</p><p className="grocery-note">The planner still works, but this list needs recipe details to finish loading.</p></div>}
    {!loading && !error && items.length === 0 && <div className="grocery-state"><ShoppingBasket size={23} /><p>Add meals to your week to build a shopping list automatically.</p></div>}
    {!loading && !error && items.length > 0 && <>
      <div className="inventory-panel"><div className="inventory-heading"><div><h3>Already have</h3><p>Mark ingredients in your pantry and they will be subtracted from the list below.</p></div>{inventory.length > 0 && <button type="button" className="inventory-clear" onClick={clearInventory}>Clear pantry</button>}</div><div className="inventory-items">{items.map((item) => <label className={`inventory-item ${hasItem(item.key) ? "is-on-hand" : ""}`} key={item.key}><input type="checkbox" checked={hasItem(item.key)} onChange={() => toggleItem(item.key)} /><span className="inventory-checkbox" aria-hidden="true"><Check size={12} /></span><span>{item.name}</span></label>)}</div></div>
      {shoppingItems.length === 0 ? <div className="grocery-state grocery-complete"><Check size={23} /><p>Your pantry has everything needed for this plan.</p></div> : <div className="grocery-list">{shoppingItems.map((item) => { const isChecked = checked.includes(item.key); return <label className={`grocery-item ${isChecked ? "is-checked" : ""}`} key={item.key}><input type="checkbox" checked={isChecked} onChange={() => toggleChecked(item.key)} /><span className="grocery-checkbox" aria-hidden="true"><Check size={13} /></span><span className="grocery-item-copy"><strong>{item.name}</strong><small>{item.measures.join(" + ") || "To taste"}</small><em>{item.recipes.join(" · ")}</em></span></label>; })}</div>}
    </>}
  </section>;
}

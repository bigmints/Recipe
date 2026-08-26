import { useMemo } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { useBudgetEstimator } from "../hooks/useBudgetEstimator";
import { defaultIngredientPrice, estimateGroceryCost, formatUsd } from "../lib/budget";
import type { GroceryItem } from "../lib/grocery";
import StorePriceComparison from "./StorePriceComparison";

type BudgetEstimatorProps = { items: GroceryItem[] };

export default function BudgetEstimator({ items }: BudgetEstimatorProps) {
  const { overrides, setPrice, resetPrices } = useBudgetEstimator();
  const total = useMemo(() => estimateGroceryCost(items, overrides), [items, overrides]);

  function updatePrice(key: string, value: string) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) setPrice(key, parsed);
  }

  return <section className="budget-section" aria-labelledby="budget-title">
    <div className="budget-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> Plan before you shop</p><h3 id="budget-title">Estimated <em>budget.</em></h3></div><Calculator size={21} aria-hidden="true" /></div>
    <div className="budget-total"><span>Expected grocery total</span><strong>{formatUsd(total)}</strong><small>Based on {items.length} missing {items.length === 1 ? "ingredient" : "ingredients"}. Prices are editable estimates.</small></div>
    {items.length === 0 ? <div className="budget-empty">Your pantry covers the current plan, so there is nothing left to price.</div> : <div className="budget-items">{items.map((item) => <label className="budget-item" key={item.key}><span>{item.name}<small>{item.measures.join(" + ") || "To taste"}</small></span><div className="price-input"><span>$</span><input type="number" min="0" step="0.25" aria-label={`Estimated price for ${item.name}`} value={overrides[item.key] ?? defaultIngredientPrice(item.name)} onChange={(event) => updatePrice(item.key, event.target.value)} /></div></label>)}</div>}
    {Object.keys(overrides).length > 0 && <button type="button" className="budget-reset" onClick={resetPrices}><RotateCcw size={13} /> Reset price estimates</button>}
    <p className="budget-note">Estimates represent typical item-level prices and do not account for store, brand, package size, tax, or currency differences.</p>
    <StorePriceComparison items={items} />
  </section>;
}

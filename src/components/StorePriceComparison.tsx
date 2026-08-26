import { LoaderCircle, MapPin, RefreshCw, Store } from "lucide-react";
import { useUserLocation } from "../hooks/useUserLocation";
import { useStorePriceComparison } from "../hooks/useStorePriceComparison";
import { formatMoney } from "../lib/storePrices";
import type { GroceryItem } from "../lib/grocery";

type StorePriceComparisonProps = { items: GroceryItem[] };

export default function StorePriceComparison({ items }: StorePriceComparisonProps) {
  const location = useUserLocation();
  const comparison = useStorePriceComparison(items, location.location);

  if (items.length === 0) return null;

  return <section className="store-comparison" aria-labelledby="store-comparison-title">
    <div className="store-comparison-heading">
      <div><p className="eyebrow"><span className="eyebrow-line" /> Public price observations</p><h3 id="store-comparison-title">Compare nearby <em>stores.</em></h3></div>
      <Store size={21} aria-hidden="true" />
    </div>
    {location.status === "idle" && <div className="location-prompt"><div><strong>See prices near you</strong><p>Share your location to find nearby supermarkets and compare community-reported prices for this list.</p></div><button type="button" className="location-button" onClick={location.requestLocation}><MapPin size={15} /> Use my location</button></div>}
    {(location.status === "loading" || comparison.loading) && <div className="comparison-state"><LoaderCircle className="spin" size={20} /><span>{location.status === "loading" ? "Requesting your location…" : "Looking up nearby store prices…"}</span></div>}
    {location.message && location.status !== "loading" && <div className="comparison-state comparison-error"><p>{location.message}</p>{location.status !== "ready" && <button type="button" className="location-button" onClick={location.requestLocation}><RefreshCw size={14} /> Try again</button>}</div>}
    {location.status === "ready" && !comparison.loading && !comparison.error && <>
      <div className="comparison-toolbar"><span>{comparison.stores.length} nearby {comparison.stores.length === 1 ? "store" : "stores"} found</span><button type="button" className="comparison-refresh" onClick={location.requestLocation}><RefreshCw size={14} /> Refresh location</button></div>
      {comparison.comparisons.length === 0 ? <div className="comparison-state"><p>No recent public price observations matched the missing ingredients nearby. The editable estimate above remains the fallback.</p></div> : <div className="comparison-grid">{comparison.comparisons.map((result) => { const currency = result.prices[0]?.currency ?? "USD"; return <article className="comparison-card" key={result.store.id}><div className="comparison-card-heading"><div><strong>{result.store.name}</strong><small>{result.store.address ?? "Nearby location"}{result.store.distanceKm !== null && ` · ${result.store.distanceKm.toFixed(1)} km`}</small></div><span>{formatMoney(result.total, currency)}</span></div><p className="comparison-coverage">{result.coveredItems} of {items.length} missing items matched · {currency} · community reported</p><div className="comparison-prices">{result.prices.map((price) => <div key={price.id}><span>{price.ingredientName}</span><strong>{formatMoney(price.price, price.currency)}</strong></div>)}</div></article>; })}</div>}
      {comparison.stores.length > comparison.comparisons.length && <p className="comparison-note">Some nearby stores have no matching public observations yet. Coverage depends on community-submitted data.</p>}
    </>}
    {location.status === "ready" && comparison.error && <div className="comparison-state comparison-error"><p>{comparison.error}</p></div>}
  </section>;
}

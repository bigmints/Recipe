import { useMemo } from "react";
import { Activity, LoaderCircle } from "lucide-react";
import { dateKey } from "../hooks/useMealPlanner";
import { usePlannerDetails } from "../hooks/usePlannerDetails";
import { aggregateDailyNutrition } from "../lib/nutrition";
import type { MealPlanEntry } from "../types";

const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

type NutritionSummaryProps = { entries: MealPlanEntry[]; weekDays: Date[] };

export default function NutritionSummary({ entries, weekDays }: NutritionSummaryProps) {
  const { details, loading, error } = usePlannerDetails(entries);
  const dailyTotals = useMemo(() => aggregateDailyNutrition(entries, details), [details, entries]);

  return <section className="nutrition-section" aria-labelledby="nutrition-title">
    <div className="nutrition-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> A little helpful context</p><h2 id="nutrition-title">Daily <em>balance.</em></h2></div><span className="estimate-badge">Estimated</span></div>
    <p className="nutrition-intro">See a quick calorie and macro snapshot for the meals on your plan. Values are approximate and intended for planning, not medical guidance.</p>
    {loading && <div className="nutrition-state"><LoaderCircle className="spin" size={22} /><span>Calculating your week…</span></div>}
    {!loading && error && <div className="nutrition-state nutrition-error"><span>{error}</span></div>}
    {!loading && !error && <div className="nutrition-days">{weekDays.map((day) => { const key = dateKey(day); const totals = dailyTotals[key]; return <div className={`nutrition-day ${totals ? "has-meals" : ""}`} key={key}><div className="nutrition-day-name"><span>{dayFormatter.format(day)}</span><strong>{dateFormatter.format(day)}</strong></div>{totals ? <><strong className="nutrition-calories">{totals.calories}<small> kcal</small></strong><div className="macro-list"><span className="macro protein"><i style={{ width: `${Math.min(100, totals.protein * 1.5)}%` }} /><b>{totals.protein}g</b><small>protein</small></span><span className="macro carbs"><i style={{ width: `${Math.min(100, totals.carbs * 0.8)}%` }} /><b>{totals.carbs}g</b><small>carbs</small></span><span className="macro fat"><i style={{ width: `${Math.min(100, totals.fat * 2)}%` }} /><b>{totals.fat}g</b><small>fat</small></span></div></> : <span className="no-meals"><Activity size={14} /> No meals planned</span>}</div>; })}</div>}
    <p className="nutrition-footnote">Estimates use ingredient-name matching and do not replace package labels or advice from a qualified professional.</p>
  </section>;
}

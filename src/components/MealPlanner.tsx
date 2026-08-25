import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { addDays, dateKey, useMealPlanner } from "../hooks/useMealPlanner";
import GroceryList from "./GroceryList";
import type { MealSlot, RecipeSummary } from "../types";

const slots: Array<{ value: MealSlot; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];
const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

type MealPlannerProps = {
  favoriteRecipes: RecipeSummary[];
  onOpenRecipe: (recipe: RecipeSummary) => void;
};

type ComposerState = { date: string; slot: MealSlot } | null;
type DragSource = { date: string; slot: MealSlot } | null;

export default function MealPlanner({ favoriteRecipes, onOpenRecipe }: MealPlannerProps) {
  const planner = useMealPlanner();
  const [composer, setComposer] = useState<ComposerState>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>("dinner");
  const [selectedDate, setSelectedDate] = useState("");
  const [dragSource, setDragSource] = useState<DragSource>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const currentWeekLabel = useMemo(() => monthFormatter.format(planner.weekStart), [planner.weekStart]);

  function openComposer(date: string, slot: MealSlot) {
    setComposer({ date, slot });
    setSelectedDate(date);
    setSelectedSlot(slot);
    setSelectedRecipeId(planner.getMeal(date, slot)?.recipe.id ?? favoriteRecipes[0]?.id ?? "");
  }

  function closeComposer() { setComposer(null); }

  function saveMeal() {
    const recipe = favoriteRecipes.find((item) => item.id === selectedRecipeId);
    if (!recipe || !selectedDate) return;
    planner.scheduleMeal(selectedDate, selectedSlot, recipe);
    closeComposer();
  }

  function handleDragStart(event: React.DragEvent<HTMLDivElement>, date: string, slot: MealSlot) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify({ date, slot }));
    setDragSource({ date, slot });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>, date: string, slot: MealSlot) {
    event.preventDefault();
    const payload = event.dataTransfer.getData("text/plain");
    try {
      const source = JSON.parse(payload) as DragSource;
      if (source?.date && source.slot) planner.moveMeal(source.date, source.slot, date, slot);
    } catch { /* Ignore drops without a Pantry meal payload. */ }
    setDragSource(null);
    setDragTarget(null);
  }

  return (
    <section className="planner-section" id="planner" aria-labelledby="planner-title">
      <div className="planner-heading">
        <div><p className="eyebrow"><span className="eyebrow-line" /> Make room for good food</p><h2 id="planner-title">Plan the <em>week.</em></h2></div>
        <div className="planner-actions"><button type="button" className="week-nav" onClick={planner.goToPreviousWeek} aria-label="Previous week"><ChevronLeft size={17} /></button><button type="button" className="today-button" onClick={planner.goToCurrentWeek}>Today</button><button type="button" className="week-nav" onClick={planner.goToNextWeek} aria-label="Next week"><ChevronRight size={17} /></button></div>
      </div>
      <div className="planner-caption"><span>{currentWeekLabel}</span><span>{planner.entries.length} planned {planner.entries.length === 1 ? "meal" : "meals"}</span></div>

      {favoriteRecipes.length === 0 ? <div className="planner-empty"><CalendarDays size={24} /><div><h3>Build a week from your saved recipes</h3><p>Save a few recipes first, then come back here to decide what is for dinner.</p></div><a href="#saved" className="text-button">Browse saved recipes</a></div> : <div className="planner-scroll"><div className="planner-grid" role="grid" aria-label={`Meal plan for the week of ${currentWeekLabel}`}>{planner.weekDays.map((day) => { const key = dateKey(day); const isToday = key === dateKey(new Date()); return <div className={`planner-day ${isToday ? "is-today" : ""}`} key={key} role="row"><div className="planner-day-header"><span>{dayFormatter.format(day)}</span><strong>{dateFormatter.format(day)}</strong>{isToday && <small>Today</small>}</div>{slots.map((slot) => { const meal = planner.getMeal(key, slot.value); return <div className={`meal-slot ${dragTarget === `${key}:${slot.value}` ? "is-drag-target" : ""}`} key={slot.value} role="gridcell" onDragOver={(event) => { event.preventDefault(); setDragTarget(`${key}:${slot.value}`); }} onDragLeave={() => setDragTarget(null)} onDrop={(event) => handleDrop(event, key, slot.value)}><span className="meal-slot-label">{slot.label}</span>{meal ? <div className={`planned-meal ${dragSource?.date === key && dragSource.slot === slot.value ? "is-dragging" : ""}`} draggable onDragStart={(event) => handleDragStart(event, key, slot.value)} onDragEnd={() => { setDragSource(null); setDragTarget(null); }} title="Drag to move this meal"><button type="button" className="planned-meal-main" onClick={() => onOpenRecipe(meal.recipe)}><span className="planned-meal-image">{meal.recipe.thumbnail || meal.recipe.image ? <img src={meal.recipe.thumbnail ?? meal.recipe.image ?? ""} alt="" /> : "🍲"}</span><span>{meal.recipe.name}</span></button><button type="button" className="remove-meal" onClick={() => planner.removeMeal(key, slot.value)} aria-label={`Remove ${meal.recipe.name} from ${slot.label}`}><X size={13} /></button></div> : <button type="button" className="add-meal-button" onClick={() => openComposer(key, slot.value)}><Plus size={15} /><span>Add meal</span></button>}</div>; })}</div>; })}</div></div>}

      <GroceryList entries={planner.entries} />

      {composer && <div className="planner-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) closeComposer(); }}><section className="planner-composer" role="dialog" aria-modal="true" aria-labelledby="composer-title"><button className="detail-close" type="button" onClick={closeComposer} aria-label="Close meal planner form"><X size={20} /></button><p className="eyebrow"><span className="eyebrow-line" /> Add to your week</p><h3 id="composer-title">Schedule a <em>meal.</em></h3><div className="composer-field"><label htmlFor="planner-date">Day</label><select id="planner-date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>{planner.weekDays.map((day) => <option value={dateKey(day)} key={dateKey(day)}>{dayFormatter.format(day)} · {dateFormatter.format(day)}</option>)}</select></div><div className="composer-field"><label htmlFor="planner-slot">Meal</label><select id="planner-slot" value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value as MealSlot)}>{slots.map((slot) => <option value={slot.value} key={slot.value}>{slot.label}</option>)}</select></div><div className="composer-field"><label htmlFor="planner-recipe">Saved recipe</label><select id="planner-recipe" value={selectedRecipeId} onChange={(event) => setSelectedRecipeId(event.target.value)}>{favoriteRecipes.map((recipe) => <option value={recipe.id} key={recipe.id}>{recipe.name}</option>)}</select></div><button type="button" className="composer-submit" onClick={saveMeal} disabled={!selectedRecipeId}>Add to plan</button></section></div>}
    </section>
  );
}

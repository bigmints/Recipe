import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, ChefHat, ChevronDown, Filter, Heart, LoaderCircle, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import RecipeCard from "./components/RecipeCard";
import { getAreas, getCategories } from "./api";
import { useRecipeSearch } from "./hooks/useRecipeSearch";
import type { RecipeOption } from "./types";

const quickSearches = ["Pasta", "Chicken", "Vegetarian", "Dessert"];

type SortOption = "relevance" | "name-asc" | "name-desc";

export default function App() {
  const initialParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialQuery = initialParams.get("q") ?? "";
  const { query, setQuery, filters, setFilters, results, status, error, executeSearch } = useRecipeSearch(initialQuery, {
    category: initialParams.get("category") ?? undefined,
    area: initialParams.get("area") ?? undefined,
  });
  const [categories, setCategories] = useState<RecipeOption[]>([]);
  const [areas, setAreas] = useState<RecipeOption[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [optionsError, setOptionsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getCategories(controller.signal), getAreas(controller.signal)])
      .then(([categoryOptions, areaOptions]) => { setCategories(categoryOptions); setAreas(areaOptions); })
      .catch(() => { if (!controller.signal.aborted) setOptionsError(true); });
    return () => controller.abort();
  }, []);

  const sortedResults = useMemo(() => {
    if (sort === "relevance") return results;
    return [...results].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sort === "name-asc" ? comparison : -comparison;
    });
  }, [results, sort]);

  const hasFilters = Boolean(filters.category || filters.area || filters.ingredient);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void executeSearch();
  }

  function handleReset() {
    setQuery("");
    setFilters({});
    setSort("relevance");
    void executeSearch("", {});
  }

  function updateFilter(key: "category" | "area", value: string) {
    const nextFilters = { ...filters, [key]: value || undefined };
    setFilters(nextFilters);
    void executeSearch(query, nextFilters);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Pantry home">
          <span className="brand-mark" aria-hidden="true"><ChefHat size={18} strokeWidth={2.4} /></span><span>pantry</span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#discover">Discover</a><a href="#about">About</a><a className="saved-link" href="#saved"><Heart size={16} /> Saved recipes</a>
        </nav>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> A calmer way to cook</p>
            <h1 id="hero-title">Good food starts <em>here.</em></h1>
            <p className="hero-description">Find recipes that fit the way you want to eat tonight. No endless scrolling, just something worth making.</p>
            <form className="search-form" role="search" onSubmit={handleSubmit}>
              <Search size={19} aria-hidden="true" /><label className="sr-only" htmlFor="recipe-search">Search recipes</label>
              <input id="recipe-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search recipe, ingredient, or cuisine..." autoComplete="off" />
              {query && <button className="clear-search" type="button" onClick={handleReset} aria-label="Clear search"><X size={16} /></button>}
              <button className="search-submit" type="submit" disabled={status === "loading"}>{status === "loading" ? <LoaderCircle className="spin" size={18} /> : <span>Find recipes</span>}</button>
            </form>
            <div className="quick-searches" aria-label="Popular searches"><span>Try</span>{quickSearches.map((item) => <button key={item} type="button" onClick={() => { setQuery(item); void executeSearch(item); }}>{item}</button>)}</div>
          </div>
          <div className="hero-art" aria-label="Recipe ingredients illustration" role="img"><div className="art-orbit art-orbit-one" /><div className="art-orbit art-orbit-two" /><div className="ingredient-card ingredient-card-lemon"><span aria-hidden="true">🍋</span><small>bright &amp; fresh</small></div><div className="ingredient-card ingredient-card-herbs"><span aria-hidden="true">🌿</span><small>from the garden</small></div><div className="plate"><span aria-hidden="true">🥗</span></div><span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✦</span></div>
        </section>

        <section className="results-section" id="discover" aria-labelledby="results-title" aria-live="polite">
          <div className="results-header"><div><p className="eyebrow"><span className="eyebrow-line" /> Discover something delicious</p><h2 id="results-title">{status === "success" ? <>Recipes for <em>you.</em></> : <>Start with a <em>craving.</em></>}</h2></div>{status === "success" && <span className="results-count">{results.length} {results.length === 1 ? "recipe" : "recipes"}</span>}</div>

          <div className="filter-toolbar">
            <button className={`filter-toggle ${filterOpen || hasFilters ? "is-active" : ""}`} type="button" aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}><SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}<ChevronDown className={filterOpen ? "rotate" : ""} size={15} /></button>
            <label className="sort-control"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="relevance">Relevance</option><option value="name-asc">Name: A to Z</option><option value="name-desc">Name: Z to A</option></select><ChevronDown size={14} /></label>
          </div>
          {filterOpen && <div className="filter-panel" aria-label="Recipe filters"><div className="filter-field"><label htmlFor="category-filter">Category</label><div className="select-wrap"><select id="category-filter" value={filters.category ?? ""} onChange={(event) => updateFilter("category", event.target.value)}><option value="">All categories</option>{categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={14} /></div></div><div className="filter-field"><label htmlFor="area-filter">Cuisine</label><div className="select-wrap"><select id="area-filter" value={filters.area ?? ""} onChange={(event) => updateFilter("area", event.target.value)}><option value="">All cuisines</option>{areas.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={14} /></div></div><div className="filter-panel-actions">{optionsError && <span className="filter-hint">Some filter options could not load.</span>}<button className="clear-filters" type="button" onClick={handleReset} disabled={!hasFilters}><X size={14} /> Clear all</button></div></div>}

          {status === "idle" && <div className="results-placeholder"><Sparkles size={22} /><p>Search above to explore recipes from around the world.</p></div>}
          {status === "loading" && <div className="results-placeholder"><LoaderCircle className="spin" size={24} /><p>Finding something delicious…</p></div>}
          {status === "error" && <div className="results-placeholder state-error"><p>{error}</p><button type="button" className="text-button" onClick={() => void executeSearch()}>Try again</button></div>}
          {status === "success" && results.length === 0 && <div className="results-placeholder"><p>No recipes matched{query ? ` “${query}”` : " those filters"}. Try a broader search.</p><button type="button" className="text-button" onClick={handleReset}>Clear search</button></div>}
          {status === "success" && sortedResults.length > 0 && <div className="recipe-grid">{sortedResults.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>}
        </section>

        <section className="discover-teaser" id="about" aria-label="About Pantry"><div><p className="eyebrow eyebrow-light"><span className="eyebrow-line" /> The pantry promise</p><h2>Less searching.<br /><em>More savoring.</em></h2></div><div className="teaser-note"><span className="teaser-number">01</span><p>Search our collection of recipes from around the world, then save the ones you want to make again.</p></div></section>
      </main>

      <footer className="site-footer"><span>© {new Date().getFullYear()} Pantry</span><span>Made for curious cooks</span></footer>
    </div>
  );
}

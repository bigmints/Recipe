import { FormEvent, useMemo } from "react";
import { ChefHat, Heart, LoaderCircle, Search, Sparkles, X } from "lucide-react";
import RecipeCard from "./components/RecipeCard";
import { useRecipeSearch } from "./hooks/useRecipeSearch";

const quickSearches = ["Pasta", "Chicken", "Vegetarian", "Dessert"];

export default function App() {
  const initialQuery = useMemo(() => new URLSearchParams(window.location.search).get("q") ?? "", []);
  const { query, setQuery, results, status, error, executeSearch } = useRecipeSearch(initialQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void executeSearch();
  }

  function handleReset() {
    setQuery("");
    void executeSearch("");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Pantry home">
          <span className="brand-mark" aria-hidden="true"><ChefHat size={18} strokeWidth={2.4} /></span>
          <span>pantry</span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#discover">Discover</a>
          <a href="#about">About</a>
          <a className="saved-link" href="#saved"><Heart size={16} /> Saved recipes</a>
        </nav>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> A calmer way to cook</p>
            <h1 id="hero-title">Good food starts <em>here.</em></h1>
            <p className="hero-description">Find recipes that fit the way you want to eat tonight. No endless scrolling, just something worth making.</p>
            <form className="search-form" role="search" onSubmit={handleSubmit}>
              <Search size={19} aria-hidden="true" />
              <label className="sr-only" htmlFor="recipe-search">Search recipes</label>
              <input id="recipe-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search recipe, ingredient, or cuisine..." autoComplete="off" />
              {query && <button className="clear-search" type="button" onClick={handleReset} aria-label="Clear search"><X size={16} /></button>}
              <button className="search-submit" type="submit" disabled={status === "loading"}>
                {status === "loading" ? <LoaderCircle className="spin" size={18} /> : <span>Find recipes</span>}
              </button>
            </form>
            <div className="quick-searches" aria-label="Popular searches">
              <span>Try</span>
              {quickSearches.map((item) => <button key={item} type="button" onClick={() => { setQuery(item); void executeSearch(item); }}>{item}</button>)}
            </div>
          </div>
          <div className="hero-art" aria-label="Recipe ingredients illustration" role="img">
            <div className="art-orbit art-orbit-one" />
            <div className="art-orbit art-orbit-two" />
            <div className="ingredient-card ingredient-card-lemon"><span aria-hidden="true">🍋</span><small>bright &amp; fresh</small></div>
            <div className="ingredient-card ingredient-card-herbs"><span aria-hidden="true">🌿</span><small>from the garden</small></div>
            <div className="plate"><span aria-hidden="true">🥗</span></div>
            <span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✦</span>
          </div>
        </section>

        <section className="results-section" id="discover" aria-labelledby="results-title" aria-live="polite">
          <div className="results-header">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> Discover something delicious</p>
              <h2 id="results-title">{status === "success" ? <>Recipes for <em>you.</em></> : <>Start with a <em>craving.</em></>}</h2>
            </div>
            {status === "success" && <span className="results-count">{results.length} {results.length === 1 ? "recipe" : "recipes"}</span>}
          </div>

          {status === "idle" && (
            <div className="results-placeholder"><Sparkles size={22} /><p>Search above to explore recipes from around the world.</p></div>
          )}
          {status === "loading" && (
            <div className="results-placeholder"><LoaderCircle className="spin" size={24} /><p>Finding something delicious…</p></div>
          )}
          {status === "error" && (
            <div className="results-placeholder state-error"><p>{error}</p><button type="button" className="text-button" onClick={() => void executeSearch()}>Try again</button></div>
          )}
          {status === "success" && results.length === 0 && (
            <div className="results-placeholder"><p>No recipes matched “{query}”. Try a broader search.</p><button type="button" className="text-button" onClick={handleReset}>Clear search</button></div>
          )}
          {status === "success" && results.length > 0 && (
            <div className="recipe-grid">{results.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>
          )}
        </section>

        <section className="discover-teaser" id="about" aria-label="About Pantry">
          <div><p className="eyebrow eyebrow-light"><span className="eyebrow-line" /> The pantry promise</p><h2>Less searching.<br /><em>More savoring.</em></h2></div>
          <div className="teaser-note"><span className="teaser-number">01</span><p>Search our collection of recipes from around the world, then save the ones you want to make again.</p></div>
        </section>
      </main>

      <footer className="site-footer"><span>© {new Date().getFullYear()} Pantry</span><span>Made for curious cooks</span></footer>
    </div>
  );
}

import { ArrowRight, ChefHat, Heart, Search } from "lucide-react";

const principles = [
  {
    label: "Find faster",
    detail: "Search by the dish you are craving.",
  },
  {
    label: "Cook with confidence",
    detail: "Every recipe keeps the important details close.",
  },
  {
    label: "Save the good ones",
    detail: "Keep inspiration ready for your next meal.",
  },
];

export default function App() {
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
            <div className="search-preview" role="search" aria-label="Recipe search preview">
              <Search size={19} aria-hidden="true" />
              <span>Search for a recipe, ingredient, or cuisine...</span>
              <button type="button" className="search-arrow" aria-label="Start searching"><ArrowRight size={18} /></button>
            </div>
            <p className="hint-text">Try “pasta”, “chicken”, or “Mexican”</p>
          </div>
          <div className="hero-art" aria-label="Recipe ingredients illustration" role="img">
            <div className="art-orbit art-orbit-one" />
            <div className="art-orbit art-orbit-two" />
            <div className="ingredient-card ingredient-card-lemon"><span aria-hidden="true">🍋</span><small>bright &amp; fresh</small></div>
            <div className="ingredient-card ingredient-card-herbs"><span aria-hidden="true">🌿</span><small>from the garden</small></div>
            <div className="plate"><span aria-hidden="true">🥗</span></div>
            <span className="art-spark spark-one">✦</span>
            <span className="art-spark spark-two">✦</span>
          </div>
        </section>

        <section className="principles-section" id="about" aria-labelledby="principles-title">
          <div className="section-heading">
            <p className="eyebrow"><span className="eyebrow-line" /> The pantry promise</p>
            <h2 id="principles-title">Less searching.<br /><em>More savoring.</em></h2>
          </div>
          <div className="principles-list">
            {principles.map((principle, index) => (
              <div className="principle-row" key={principle.label}>
                <span className="principle-index">0{index + 1}</span>
                <div><h3>{principle.label}</h3><p>{principle.detail}</p></div>
                <ArrowRight size={17} aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        <section className="discover-teaser" id="discover" aria-label="Recipe discovery teaser">
          <div>
            <p className="eyebrow eyebrow-light"><span className="eyebrow-line" /> Your next favorite</p>
            <h2>There is always<br /><em>something delicious.</em></h2>
          </div>
          <div className="teaser-note"><span className="teaser-number">01</span><p>Search our collection of recipes from around the world.</p></div>
        </section>
      </main>

      <footer className="site-footer"><span>© {new Date().getFullYear()} Pantry</span><span>Made for curious cooks</span></footer>
    </div>
  );
}

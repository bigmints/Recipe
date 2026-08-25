import { ExternalLink, Heart, LoaderCircle, Play, X } from "lucide-react";
import type { Recipe } from "../types";

type RecipeDetailProps = {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
  isFavorite: boolean;
  onClose: () => void;
  onFavorite: () => void;
};

export default function RecipeDetail({ recipe, loading, error, isFavorite, onClose, onFavorite }: RecipeDetailProps) {
  if (!recipe && !loading && !error) return null;

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close recipe details"><X size={20} /></button>
        {loading && <div className="detail-state"><LoaderCircle className="spin" size={28} /><p>Loading recipe details…</p></div>}
        {!loading && error && <div className="detail-state detail-error"><p>{error}</p><button type="button" className="text-button" onClick={onClose}>Close</button></div>}
        {!loading && recipe && <div className="detail-content">
          <div className="detail-image-wrap">{recipe.image ? <img src={recipe.image} alt={recipe.name} /> : <div className="image-fallback" aria-hidden="true">🍲</div>}</div>
          <div className="detail-copy">
            <div className="detail-topline"><p className="recipe-meta">{recipe.category ?? "Recipe"}{recipe.area ? ` · ${recipe.area}` : ""}</p><button className={`detail-favorite ${isFavorite ? "is-favorite" : ""}`} type="button" onClick={onFavorite} aria-label={`${isFavorite ? "Remove" : "Save"} ${recipe.name} ${isFavorite ? "from favorites" : "to favorites"}`} aria-pressed={isFavorite}><Heart size={17} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? "Saved" : "Save"}</button></div>
            <h2 id="detail-title">{recipe.name}</h2>
            {recipe.tags.length > 0 && <div className="tag-list" aria-label="Recipe tags">{recipe.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
            <div className="detail-actions">{recipe.youtube && <a href={recipe.youtube} target="_blank" rel="noreferrer"><Play size={14} fill="currentColor" /> Watch video</a>}{recipe.source && <a href={recipe.source} target="_blank" rel="noreferrer">Original source <ExternalLink size={14} /></a>}</div>
            <div className="detail-divider" />
            <div className="detail-columns"><div><h3>Ingredients</h3><ul className="ingredient-list">{recipe.ingredients.map((ingredient) => <li key={`${ingredient.name}-${ingredient.measure}`}><span>{ingredient.name}</span><strong>{ingredient.measure}</strong></li>)}</ul></div><div><h3>Instructions</h3><div className="instructions">{recipe.instructions?.split(/\r?\n+/).filter(Boolean).map((step, index) => <p key={`${step.slice(0, 12)}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{step.trim()}</p>) ?? <p>Instructions are not available for this recipe.</p>}</div></div></div>
          </div>
        </div>}
      </section>
    </div>
  );
}

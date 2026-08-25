import { ArrowUpRight, Heart } from "lucide-react";
import type { RecipeSummary } from "../types";

type RecipeCardProps = {
  recipe: RecipeSummary;
  isFavorite?: boolean;
  onFavorite?: (recipe: RecipeSummary) => void;
  onOpen?: (recipe: RecipeSummary) => void;
};

export default function RecipeCard({ recipe, isFavorite = false, onFavorite, onOpen }: RecipeCardProps) {
  return (
    <article className="recipe-card">
      <button className="recipe-image-button" type="button" onClick={() => onOpen?.(recipe)} aria-label={`Open ${recipe.name}`}>
        {recipe.image ? <img src={recipe.image} alt="" loading="lazy" /> : <div className="image-fallback" aria-hidden="true">🍲</div>}
        <span className="card-open-icon" aria-hidden="true"><ArrowUpRight size={16} /></span>
      </button>
      <div className="recipe-card-body">
        <div>
          <p className="recipe-meta">{recipe.category ?? "Recipe"}{recipe.area ? ` · ${recipe.area}` : ""}</p>
          <h3>{recipe.name}</h3>
        </div>
        {onFavorite && (
          <button className={`favorite-button ${isFavorite ? "is-favorite" : ""}`} type="button" onClick={() => onFavorite(recipe)} aria-label={`${isFavorite ? "Remove" : "Save"} ${recipe.name} ${isFavorite ? "from favorites" : "to favorites"}`} aria-pressed={isFavorite}>
            <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    </article>
  );
}

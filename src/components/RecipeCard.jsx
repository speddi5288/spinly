import { useState } from 'react'
import ScoopMark from './ScoopMark.jsx'

export default function RecipeCard({ recipe }) {
  const [failedImage, setFailedImage] = useState(null)
  const showImage = recipe.image_url && failedImage !== recipe.image_url

  return (
    <article className="recipe-card" aria-labelledby={`${recipe.id}-title`}>
      <div className="recipe-photo">
        {showImage ? (
          <img
            src={recipe.image_url}
            alt={recipe.image_alt || recipe.title}
            width="1254"
            height="1254"
            loading="lazy"
            onError={() => setFailedImage(recipe.image_url)}
          />
        ) : (
          <div className="recipe-photo-fallback" role="img" aria-label={`${recipe.title}: photo unavailable`}>
            <ScoopMark /><span>Photo coming soon</span>
          </div>
        )}
        <span className="tub-badge">{recipe.tub_size_oz} oz tub</span>
      </div>
      <div className="recipe-card-body">
        <p className="recipe-program">{recipe.program}</p>
        <h3 id={`${recipe.id}-title`}>{recipe.title}</h3>
        <p className="recipe-description">{recipe.description}</p>
        <dl className="recipe-nutrition" aria-label="Nutrition per tub">
          <div><dt>Calories</dt><dd>{recipe.calories}<span> kcal</span></dd></div>
          <div><dt>Protein</dt><dd>{recipe.protein}<span> g</span></dd></div>
          <div><dt>Carbs</dt><dd>{recipe.carbs}<span> g</span></dd></div>
          <div><dt>Fat</dt><dd>{recipe.fat}<span> g</span></dd></div>
        </dl>
      </div>
    </article>
  )
}

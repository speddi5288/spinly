import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategory } from '../lib/categories.js'
import { formatAverage } from '../lib/ratings.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { useRatingStats } from '../lib/useRatings.js'
import { useUserData } from '../lib/userData.js'
import CategoryMark from './CategoryMark.jsx'
import StarIcon from './StarIcon.jsx'

function Heart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.2 5.2 3.1 1.6-1.9 3-3.1 5.2-3.1 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21Z" fill="currentColor" />
    </svg>
  )
}

export default function RecipeCard({ recipe }) {
  const [failedImage, setFailedImage] = useState(null)
  const { favorites } = useUserData()
  const rating = useRatingStats()[recipe.id]
  const id = useId()
  const titleId = `${id}-title`
  const savedId = `${id}-saved`
  const saved = favorites.includes(recipe.id)
  const showImage = recipe.image_url && failedImage !== recipe.image_url
  const creami = recipe.category === 'creami'
  const eyebrow = creami ? recipe.program : getCategory(recipe.category).short
  const per = creami ? 'tub' : getCategory(recipe.category).serving

  return (
    <article className="recipe-card" aria-labelledby={titleId}>
      <Link className="recipe-card-link" to={`/recipes/${recipe.id}`} aria-labelledby={saved ? `${titleId} ${savedId}` : titleId}>
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
            <div className="recipe-photo-fallback" aria-hidden="true"><CategoryMark category={recipe.category} /></div>
          )}
          {saved && <span className="saved-mark"><Heart /><span className="sr-only" id={savedId}>Saved</span></span>}
          {creami && <span className="tub-badge">{recipe.tub_size_oz} oz tub</span>}
        </div>
        <div className="recipe-card-body">
          <div className="recipe-card-text">
            <div className="recipe-card-meta">
              <p className="recipe-program">{eyebrow}</p>
              {rating && (
                <span className="card-rating" aria-label={`Rated ${formatAverage(rating.average)} out of 5`}>
                  <StarIcon size={12} />
                  {formatAverage(rating.average)}
                  {isSupabaseConfigured && <span>({rating.count})</span>}
                </span>
              )}
            </div>
            <h3 id={titleId}>{recipe.title}</h3>
            {recipe.description && <p className="recipe-description">{recipe.description}</p>}
          </div>
          <dl className="recipe-nutrition" aria-label={`Nutrition per ${per}`}>
            <div><dt>Calories</dt><dd>{recipe.calories}<span> kcal</span></dd></div>
            <div><dt>Protein</dt><dd>{recipe.protein}<span> g</span></dd></div>
            <div><dt>Carbs</dt><dd>{recipe.carbs}<span> g</span></dd></div>
            <div><dt>Fat</dt><dd>{recipe.fat}<span> g</span></dd></div>
          </dl>
        </div>
      </Link>
    </article>
  )
}

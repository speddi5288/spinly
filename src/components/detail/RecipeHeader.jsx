import { useState } from 'react'
import { getCategory } from '../../lib/categories.js'
import CategoryMark from '../CategoryMark.jsx'

export default function RecipeHeader({ recipe, children }) {
  const [failedImage, setFailedImage] = useState(null)
  const showImage = recipe.image_url && failedImage !== recipe.image_url

  return (
    <header className="detail-header">
      <div className="recipe-photo detail-photo">
        {showImage ? (
          <img
            src={recipe.image_url}
            alt={recipe.image_alt || recipe.title}
            width="1254"
            height="1254"
            fetchPriority="high"
            onError={() => setFailedImage(recipe.image_url)}
          />
        ) : (
          <div className="recipe-photo-fallback" role="img" aria-label={`${recipe.title}: photo unavailable`}>
            <CategoryMark category={recipe.category} />
          </div>
        )}
      </div>
      <div className="detail-intro">
        <p className="eyebrow detail-eyebrow">
          <span className="short-line" aria-hidden="true" />
          {recipe.program ?? getCategory(recipe.category).short}
          {recipe.source === 'starter' && !recipe.tested && <span className="detail-tag">Untested</span>}
        </p>
        <h1 className="page-title detail-title" id="detail-title">{recipe.title}</h1>
        {recipe.description && <p className="detail-description">{recipe.description}</p>}
        {children}
      </div>
    </header>
  )
}

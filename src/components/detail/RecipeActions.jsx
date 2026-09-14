import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { createPint } from '../../lib/pints.js'
import { userData, useUserData } from '../../lib/userData.js'

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4 7.4 4c2 0 3.5 1.1 4.6 2.7C13.1 5.1 14.6 4 16.6 4c3.5 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatReady(iso) {
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
}

export default function RecipeActions({ recipe }) {
  const { favorites } = useUserData()
  const { user } = useAuth()
  const [loggedAt, setLoggedAt] = useState(null)
  const saved = favorites.includes(recipe.id)
  const canEdit = recipe.source === 'community' && Boolean(user?.id) && user.id === recipe.user_id

  function logPint() {
    const pint = createPint({ recipeId: recipe.id, recipeTitle: recipe.title, freezeHours: recipe.freeze_time_hours })
    userData.logPint(pint)
    setLoggedAt(pint.readyAt)
  }

  return (
    <div className="detail-actions">
      <div className="detail-action-row">
        <button type="button" className="filter-chip detail-save" aria-pressed={saved} onClick={() => userData.toggleFavorite(recipe.id)}>
          <HeartIcon filled={saved} /> Save
        </button>
        {recipe.category === 'creami' && (
          <button type="button" className="button button-primary button-small detail-button" onClick={logPint}>
            Froze a pint
          </button>
        )}
        {canEdit && <Link className="text-link detail-edit" to={`/recipes/${recipe.id}/edit`}>Edit</Link>}
      </div>
      <p className="detail-confirm" role="status">
        {loggedAt && (
          <>
            <span className="status-dot" aria-hidden="true" />
            Ready {formatReady(loggedAt)}
            <Link className="text-link" to="/fridge">Fridge <span aria-hidden="true">→</span></Link>
          </>
        )}
      </p>
    </div>
  )
}

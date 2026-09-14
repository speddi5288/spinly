import { Link } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard.jsx'
import ScoopMark from '../components/ScoopMark.jsx'
import { useRecipes } from '../lib/useRecipes.js'
import { useUserData } from '../lib/userData.js'
import '../styles/saved.css'

function SavedContent() {
  const { favorites } = useUserData()
  const { recipes, loading, error, reload } = useRecipes()

  if (favorites.length > 0 && recipes.length === 0) {
    if (loading) return <p className="saved-status" role="status">Loading…</p>
    if (error) {
      return (
        <div className="saved-status" role="alert">
          <p>Couldn’t load recipes.</p>
          <button type="button" className="clear-filters" onClick={reload}>Retry</button>
        </div>
      )
    }
  }

  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]))
  const saved = [...favorites].reverse().map((id) => byId.get(id)).filter(Boolean)

  if (saved.length === 0) {
    return (
      <div className="empty-collection saved-empty">
        <div className="empty-icon"><ScoopMark /></div>
        <h3>Nothing saved yet.</h3>
        <Link className="text-link" to="/#collections">Browse recipes</Link>
      </div>
    )
  }

  return (
    <div className="recipe-grid saved-grid">
      {saved.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
    </div>
  )
}

export default function Saved() {
  return (
    <section className="page container saved-page" aria-labelledby="saved-title">
      <h1 id="saved-title" className="page-title">Your <em>favorites.</em></h1>
      <SavedContent />
    </section>
  )
}

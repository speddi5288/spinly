import { Link } from 'react-router-dom'
import { INGREDIENTS } from '../../lib/ingredients.js'
import { matchPantry } from '../../lib/pantry.js'
import RecipeCard from '../RecipeCard.jsx'

function neededNames({ recipe, missing }) {
  const catalog = missing.map((id) => INGREDIENTS[id]?.name ?? id)
  const freeText = recipe.ingredients.filter((line) => !line.optional && !line.ingredientId).map((line) => line.name)
  return [...catalog, ...freeText]
}

function Message({ children }) {
  return <p className="panel pantry-message">{children}</p>
}

export default function PantryResults({ pantry, recipes, loading, error, reload }) {
  if (pantry.length === 0) return <Message>Pick what you have.</Message>
  if (loading && recipes.length === 0) return <p className="pantry-message" role="status">Loading…</p>
  if (error && recipes.length === 0) {
    return (
      <div className="panel pantry-message" role="alert">
        <p>Couldn’t load recipes.</p>
        <button type="button" className="clear-filters" onClick={reload}>Retry</button>
      </div>
    )
  }

  const matches = matchPantry(recipes, pantry)
  const ready = matches.filter((match) => match.missing.length === 0 && match.unknown === 0)
  const almost = matches.filter((match) => {
    const gap = match.missing.length + match.unknown
    return gap === 1 || gap === 2
  })

  return (
    <>
      <p className="sr-only" role="status">{ready.length} ready, {almost.length} almost</p>
      {ready.length === 0 && almost.length === 0 && <Message>No close matches.</Message>}

      {ready.length > 0 && (
        <section aria-labelledby="pantry-ready-title">
          <h2 id="pantry-ready-title" className="eyebrow pantry-heading pantry-results-title">
            Ready to make <span className="pantry-count">{ready.length}</span>
          </h2>
          <div className="recipe-grid">
            {ready.map(({ recipe }) => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>
        </section>
      )}

      {almost.length > 0 && (
        <section aria-labelledby="pantry-almost-title">
          <h2 id="pantry-almost-title" className="eyebrow pantry-heading pantry-results-title">
            Almost <span className="pantry-count">{almost.length}</span>
          </h2>
          <ul className="almost-list">
            {almost.map((match) => (
              <li key={match.recipe.id}>
                <Link to={`/recipes/${match.recipe.id}`}>{match.recipe.title}</Link>
                <span className="almost-need">Need {neededNames(match).join(', ')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

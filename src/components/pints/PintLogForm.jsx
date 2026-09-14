import { useState } from 'react'
import { createPint } from '../../lib/pints.js'
import { userData } from '../../lib/userData.js'

/** Reads a datetime-local value ("YYYY-MM-DDTHH:mm") as local time. */
function parseLocal(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!match) return null
  const [, year, month, day, hour, minute] = match.map(Number)
  const date = new Date(year, month - 1, day, hour, minute)
  return Number.isNaN(date.getTime()) ? null : date
}

export default function PintLogForm({ recipes, loading, onLogged }) {
  const [recipeId, setRecipeId] = useState('')
  const [frozenAt, setFrozenAt] = useState('')
  const [error, setError] = useState(null)
  const options = [...recipes].sort((a, b) => a.title.localeCompare(b.title))

  function submit(event) {
    event.preventDefault()
    const recipe = recipes.find((item) => item.id === recipeId)
    if (!recipe) {
      setError({ field: 'recipe', message: 'Choose a recipe.' })
      return
    }
    let now = new Date()
    if (frozenAt) {
      const parsed = parseLocal(frozenAt)
      if (!parsed) {
        setError({ field: 'time', message: 'Check the date and time.' })
        return
      }
      if (parsed.getTime() > now.getTime() + 60000) {
        setError({ field: 'time', message: 'Use a time that has passed.' })
        return
      }
      now = parsed
    }
    userData.logPint(createPint({ recipeId: recipe.id, recipeTitle: recipe.title, freezeHours: recipe.freeze_time_hours ?? 24, now }))
    setRecipeId('')
    setFrozenAt('')
    setError(null)
    onLogged(recipe.title)
  }

  return (
    <form className="pint-log" aria-labelledby="pint-log-title" onSubmit={submit} noValidate>
      <h2 id="pint-log-title" className="eyebrow pints-heading">Log a pint</h2>
      <div className="pint-log-fields">
        <div className="pint-field">
          <label htmlFor="pint-recipe">Recipe</label>
          <select
            id="pint-recipe"
            value={recipeId}
            disabled={loading && recipes.length === 0}
            aria-invalid={error?.field === 'recipe'}
            aria-describedby={error?.field === 'recipe' ? 'pint-log-error' : undefined}
            onChange={(event) => setRecipeId(event.target.value)}
          >
            <option value="">{loading && recipes.length === 0 ? 'Loading…' : 'Choose'}</option>
            {options.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.title}</option>)}
          </select>
        </div>
        <div className="pint-field">
          <label htmlFor="pint-frozen">Frozen <span>optional</span></label>
          <input
            id="pint-frozen"
            type="datetime-local"
            value={frozenAt}
            aria-invalid={error?.field === 'time'}
            aria-describedby={error?.field === 'time' ? 'pint-log-error' : undefined}
            onChange={(event) => setFrozenAt(event.target.value)}
          />
        </div>
        <button type="submit" className="button button-primary pint-add">Add</button>
      </div>
      {error && <p className="field-error" id="pint-log-error" role="alert">{error.message}</p>}
    </form>
  )
}

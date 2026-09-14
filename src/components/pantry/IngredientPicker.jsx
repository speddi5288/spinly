import { useState } from 'react'
import { AISLE_LABELS, AISLE_ORDER, INGREDIENT_LIST } from '../../lib/ingredients.js'
import { userData } from '../../lib/userData.js'

const PICKABLE = INGREDIENT_LIST.filter((ingredient) => !ingredient.staple)

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function matchesQuery(ingredient, query) {
  if (!query) return true
  return [ingredient.name, ...(ingredient.aliases ?? [])].some((name) => name.toLowerCase().includes(query))
}

export default function IngredientPicker({ pantry }) {
  const [query, setQuery] = useState('')
  const owned = new Set(pantry)
  const selectedCount = PICKABLE.filter((ingredient) => owned.has(ingredient.id)).length
  const normalized = query.trim().toLowerCase()
  const groups = AISLE_ORDER
    .map((aisle) => ({ aisle, items: PICKABLE.filter((item) => item.aisle === aisle && matchesQuery(item, normalized)) }))
    .filter((group) => group.items.length > 0)

  return (
    <section className="panel pantry-picker" aria-labelledby="pantry-picker-title">
      <div className="pantry-picker-head">
        <h2 id="pantry-picker-title" className="eyebrow pantry-heading">Ingredients</h2>
        {selectedCount > 0 && (
          <button type="button" className="clear-filters" onClick={() => userData.clearPantry()}>
            Clear ({selectedCount})
          </button>
        )}
      </div>

      <label className="sr-only" htmlFor="pantry-search">Search ingredients</label>
      <input
        id="pantry-search"
        className="pantry-search"
        type="search"
        placeholder="Search"
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {groups.length === 0 && <p className="pantry-no-match">No match.</p>}

      {groups.map(({ aisle, items }) => (
        <div className="pantry-aisle" role="group" aria-labelledby={`aisle-${aisle}`} key={aisle}>
          <h3 id={`aisle-${aisle}`}>{AISLE_LABELS[aisle]}</h3>
          <div className="pantry-chips">
            {items.map((ingredient) => {
              const pressed = owned.has(ingredient.id)
              return (
                <button
                  key={ingredient.id}
                  type="button"
                  className="filter-chip"
                  aria-pressed={pressed}
                  onClick={() => userData.togglePantry(ingredient.id)}
                >
                  <span aria-hidden="true">{pressed ? '✓' : '+'}</span> {capitalize(ingredient.name)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

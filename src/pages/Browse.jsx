import { useState } from 'react'
import RecipeCard from '../components/RecipeCard.jsx'
import ScoopMark from '../components/ScoopMark.jsx'
import { readNutritionLimit, selectRecipes } from '../lib/recipes.js'
import { useRecipes } from '../lib/useRecipes.js'

const emptyFilters = { maxCalories: '', minProtein: '', maxCarbs: '', under300: false }
const nutritionFields = [
  { key: 'maxCalories', label: 'Max calories', unit: 'kcal' },
  { key: 'minProtein', label: 'Min protein', unit: 'g' },
  { key: 'maxCarbs', label: 'Max carbs', unit: 'g' },
]

export default function Browse() {
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState('newest')
  const { recipes: allRecipes, loading, error, reload } = useRecipes()
  const recipes = selectRecipes(allRecipes, filters, sort)
  const hasFilters = filters.under300 || nutritionFields.some(({ key }) => filters[key] !== '')
  const waiting = allRecipes.length === 0 && (loading || error)

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <section className="recipe-section container" id="recipes" aria-labelledby="recipes-title">
      <div className="section-heading">
        <div><p className="eyebrow">THE RECIPE COLLECTION</p><h2 id="recipes-title">Find your next favorite.</h2></div>
      </div>

      <div className="browse-controls">
        <div className="browse-toolbar">
          <div className="quick-filters">
            <button
              type="button"
              className="filter-chip"
              aria-pressed={filters.under300}
              onClick={() => updateFilter('under300', !filters.under300)}
            >
              <span aria-hidden="true">{filters.under300 ? '✓' : '+'}</span> Under 300 kcal
            </button>
            {hasFilters && <button type="button" className="clear-filters" onClick={() => setFilters(emptyFilters)}>Clear filters</button>}
          </div>
          <label className="sort-control" htmlFor="recipe-sort">
            <span>Sort by</span>
            <select id="recipe-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="protein_desc">Protein: high to low</option>
              <option value="calories_asc">Calories: low to high</option>
            </select>
          </label>
        </div>

        <fieldset className="nutrition-filters">
          <legend className="sr-only">Filter by nutrition per tub</legend>
          {nutritionFields.map(({ key, label, unit }) => {
            const invalid = filters[key] !== '' && readNutritionLimit(filters[key]) === null
            return (
              <div className="nutrition-filter" key={key}>
                <label htmlFor={`filter-${key}`}>{label}</label>
                <div className="number-field">
                  <input
                    id={`filter-${key}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    placeholder="Any"
                    value={filters[key]}
                    onChange={(event) => updateFilter(key, event.target.value)}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? `${key}-error` : undefined}
                  />
                  <span aria-hidden="true">{unit}</span>
                </div>
                {invalid && <p className="field-error" id={`${key}-error`}>Use zero or more.</p>}
              </div>
            )
          })}
        </fieldset>
      </div>

      {error && (
        <div className="browse-status" role="alert">
          <span>{allRecipes.length ? 'Some recipes didn’t load.' : 'Couldn’t load recipes.'}</span>
          <button type="button" className="browse-retry" onClick={reload}>Retry</button>
        </div>
      )}
      {loading && allRecipes.length === 0 && !error && <p className="browse-status" role="status">Loading recipes…</p>}

      {!waiting && (
        <>
          <div className="results-heading">
            <p role="status" aria-live="polite">Showing <strong>{recipes.length}</strong> of {allRecipes.length} recipes</p>
            <span>Nutrition per tub</span>
          </div>

          {recipes.length > 0 ? (
            <div className="recipe-grid">
              {recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          ) : (
            <div className="empty-collection">
              <div className="empty-icon"><ScoopMark /></div>
              <h3>{hasFilters ? 'No matches.' : 'No recipes yet.'}</h3>
              {hasFilters && <button type="button" className="button button-primary empty-reset" onClick={() => setFilters(emptyFilters)}>Clear filters</button>}
            </div>
          )}
        </>
      )}
    </section>
  )
}

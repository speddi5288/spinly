import { INGREDIENTS } from '../../lib/ingredients.js'

const FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fiber', label: 'Fiber', unit: 'g' },
  { key: 'sugars', label: 'Sugars', unit: 'g' },
]

function usdaSources(ingredients) {
  const seen = new Set()
  const sources = []
  for (const line of ingredients) {
    const usda = INGREDIENTS[line.ingredientId]?.usda
    if (!usda || seen.has(usda.fdcId)) continue
    seen.add(usda.fdcId)
    sources.push(usda)
  }
  return sources
}

export default function NutritionPanel({ recipe, scale, label }) {
  const fields = FIELDS.filter(({ key }) => recipe[key] !== null && recipe[key] !== undefined)
  const sources = recipe.nutrition_source === 'usda' ? usdaSources(recipe.ingredients) : []

  return (
    <section className="panel detail-panel" aria-labelledby="nutrition-title">
      <h2 className="detail-heading" id="nutrition-title">{label}</h2>
      <dl className="detail-nutrition">
        {fields.map(({ key, label, unit }) => {
          const value = Number(recipe[key]) * scale
          return (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{Number.isFinite(value) ? Math.round(value) : '—'}<span> {unit}</span></dd>
            </div>
          )
        })}
      </dl>

      {sources.length > 0 && (
        <details className="detail-sources">
          <summary>USDA sources</summary>
          <ul>
            {sources.map((usda) => (
              <li key={usda.fdcId}>
                <a href={`https://fdc.nal.usda.gov/food-details/${usda.fdcId}/nutrients`} target="_blank" rel="noopener noreferrer">
                  {usda.description}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          {recipe.nutrition_notes?.length > 0 && <p>Not reported: {recipe.nutrition_notes.join('; ').toLowerCase()}.</p>}
        </details>
      )}
    </section>
  )
}

import { useState } from 'react'
import { INGREDIENTS } from '../../lib/ingredients.js'
import { formatLine } from '../../lib/units.js'

const SECTIONS = [
  { id: 'base', title: null },
  { id: 'mix-in', title: 'Mix-in' },
  { id: 'topping', title: 'Topping' },
]

export default function IngredientList({ recipeId, ingredients, scale, units }) {
  const [checked, setChecked] = useState(() => new Set())
  const lines = ingredients.map((line, index) => ({ line, key: `${recipeId}-ingredient-${index}` }))

  function toggle(key) {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return SECTIONS.map(({ id, title }) => {
    const items = lines.filter(({ line }) => (line.section ?? 'base') === id)
    if (!items.length) return null
    return (
      <div className="ingredient-group" key={id}>
        {title && <h3 className="ingredient-group-title">{title}</h3>}
        <ul className="ingredient-list">
          {items.map(({ line, key }) => {
            const text = formatLine(line, INGREDIENTS[line.ingredientId] ?? null, scale, units)
            const done = checked.has(key)
            return (
              <li key={key} className={done ? 'is-done' : undefined}>
                <input id={key} type="checkbox" checked={done} onChange={() => toggle(key)} />
                <label htmlFor={key}>
                  <span className="ingredient-amount">{text.amount}</span>{' '}
                  <span className="ingredient-label">{text.label}</span>
                  {text.detail && <span className="ingredient-muted"> ({text.detail})</span>}
                  {line.prep && <span className="ingredient-muted">, {line.prep}</span>}
                  {line.optional && <span className="detail-tag">optional</span>}
                </label>
              </li>
            )
          })}
        </ul>
      </div>
    )
  })
}

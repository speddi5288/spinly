import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, getCategory, isCategoryId } from '../lib/categories.js'
import { PROGRAM_IDS, PROGRAM_NAMES } from '../lib/machines.js'
import { UNITS } from '../lib/units.js'

// Keep in step with the checks in supabase/schema.sql.
const MAX_INGREDIENTS = 50
const MAX_STEPS = 40
const MAX_STEP_LENGTH = 1000
const MAX_AMOUNT = 10000
const NUTRITION = [
  { key: 'calories', label: 'Calories', unit: 'kcal', max: 10000 },
  { key: 'protein', label: 'Protein', unit: 'g', max: 1000 },
  { key: 'carbs', label: 'Carbs', unit: 'g', max: 1000 },
  { key: 'fat', label: 'Fat', unit: 'g', max: 1000 },
]

let lineCount = 0
function newLine(line = {}) {
  lineCount += 1
  return {
    key: `l${lineCount}`,
    name: line.name ?? '',
    amount: line.amount == null || Number.isNaN(line.amount) ? '' : String(line.amount),
    unit: UNITS.includes(line.unit) ? line.unit : 'cup',
  }
}

const text = (value) => (value == null ? '' : String(value))

/** A normalized recipe (or null) → form values. */
function initialValues(recipe, defaultCategory) {
  if (!recipe) {
    return {
      category: isCategoryId(defaultCategory) ? defaultCategory : 'creami',
      title: '', description: '', image_url: '', tub_size_oz: '16', program: '', freeze_time_hours: '24',
      freeze_note: '', respin_note: '', calories: '', protein: '', carbs: '', fat: '',
      ingredients: [newLine(), newLine(), newLine()], steps: '',
    }
  }
  return {
    category: isCategoryId(recipe.category) ? recipe.category : 'creami',
    title: text(recipe.title),
    description: text(recipe.description),
    image_url: text(recipe.image_url),
    tub_size_oz: recipe.tub_size_oz === 24 ? '24' : '16',
    program: PROGRAM_IDS.includes(recipe.programs?.[0]) ? recipe.programs[0] : '',
    freeze_time_hours: text(recipe.freeze_time_hours || 24),
    freeze_note: text(recipe.freeze_note),
    respin_note: text(recipe.respin_note),
    calories: text(recipe.calories),
    protein: text(recipe.protein),
    carbs: text(recipe.carbs),
    fat: text(recipe.fat),
    ingredients: recipe.ingredients?.length ? recipe.ingredients.map((line) => newLine(line)) : [newLine()],
    steps: (recipe.steps ?? []).join('\n'),
  }
}

function readNumber(value) {
  const trimmed = String(value).trim()
  if (!trimmed) return null
  const number = Number(trimmed)
  return Number.isFinite(number) ? number : Number.NaN
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && !/\s/.test(value)
  } catch {
    return false
  }
}

const lineId = (line, field) => `recipe-line-${line.key}-${field}`

/** Errors keyed by the id of the control they belong to, in page order. */
function validate(values) {
  const errors = {}
  if (!values.title.trim()) errors['recipe-title'] = 'Add a title.'
  const imageUrl = values.image_url.trim()
  if (imageUrl && !isHttpUrl(imageUrl)) errors['recipe-image_url'] = 'Use an http:// or https:// link.'
  if (values.category === 'creami') {
    if (!PROGRAM_IDS.includes(values.program)) errors['recipe-program'] = 'Choose a program.'
    const hours = readNumber(values.freeze_time_hours)
    if (hours === null || !(hours >= 1 && hours <= 168)) errors['recipe-freeze_time_hours'] = 'Use 1 to 168 hours.'
  }

  for (const { key, max } of NUTRITION) {
    const number = readNumber(values[key])
    if (number === null) errors[`recipe-${key}`] = 'Required.'
    else if (!(number >= 0)) errors[`recipe-${key}`] = 'Use zero or more.'
    else if (number > max) errors[`recipe-${key}`] = `Use ${max.toLocaleString('en-US')} or less.`
  }

  let filled = 0
  for (const line of values.ingredients) {
    const amount = readNumber(line.amount)
    if (!line.name.trim() && amount === null) continue
    filled += 1
    if (!line.name.trim()) errors[lineId(line, 'name')] = 'Add a name.'
    if (amount === null || !(amount > 0)) errors[lineId(line, 'amount')] = 'Use more than 0.'
    else if (amount > MAX_AMOUNT) errors[lineId(line, 'amount')] = 'Too large.'
  }
  if (!filled) errors['recipe-ingredients'] = 'Add at least one ingredient.'

  const steps = values.steps.split('\n').map((step) => step.trim()).filter(Boolean)
  if (!steps.length) errors['recipe-steps'] = 'Add at least one step.'
  else if (steps.length > MAX_STEPS) errors['recipe-steps'] = `Use ${MAX_STEPS} steps or fewer.`
  else if (steps.some((step) => step.length > MAX_STEP_LENGTH)) errors['recipe-steps'] = 'Shorten the longest step.'

  return errors
}

function focusSoon(id, fallbackId) {
  requestAnimationFrame(() => {
    const element = document.getElementById(id) ?? (fallbackId && document.getElementById(fallbackId))
    element?.focus()
  })
}

/** aria wiring for a control and its inline error. */
function describedBy(id, error, extra) {
  const ids = [error && `${id}-error`, extra].filter(Boolean)
  return { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': ids.length ? ids.join(' ') : undefined }
}

function FieldError({ id, error }) {
  return error ? <p className="field-error" id={`${id}-error`}>{error}</p> : null
}

function Optional() {
  return <span className="form-optional">optional</span>
}

/**
 * Add/edit form. `onSave(values)` resolves to { error } (a short message, or null on success).
 */
export default function RecipeForm({ recipe = null, defaultCategory = 'creami', onSave, cancelTo = '/', submitLabel = 'Save recipe' }) {
  const [values, setValues] = useState(() => initialValues(recipe, defaultCategory))
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const savingRef = useRef(false)
  const errors = submitted ? validate(values) : {}
  const lines = values.ingredients
  const creami = values.category === 'creami'

  const set = (key) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [key]: value }))
  }

  function setLine(key, field, value) {
    setValues((current) => ({
      ...current,
      ingredients: current.ingredients.map((line) => (line.key === key ? { ...line, [field]: value } : line)),
    }))
  }

  function addLine() {
    if (lines.length >= MAX_INGREDIENTS) return
    const line = newLine()
    setValues((current) => ({ ...current, ingredients: [...current.ingredients, line] }))
    focusSoon(lineId(line, 'name'))
  }

  function removeLine(index) {
    if (lines.length <= 1) return
    const next = lines[index + 1] ?? lines[index - 1]
    setValues((current) => ({ ...current, ingredients: current.ingredients.filter((_, i) => i !== index) }))
    focusSoon(lineId(next, 'name'))
  }

  function moveLine(index, delta) {
    const target = index + delta
    if (target < 0 || target >= lines.length) return
    const line = lines[index]
    setValues((current) => {
      const list = [...current.ingredients]
      ;[list[index], list[target]] = [list[target], list[index]]
      return { ...current, ingredients: list }
    })
    // Keep focus on the same control; if it just became disabled, use the opposite arrow.
    const atEdge = delta < 0 ? target === 0 : target === lines.length - 1
    const direction = delta < 0 ? 'up' : 'down'
    const opposite = delta < 0 ? 'down' : 'up'
    focusSoon(lineId(line, atEdge ? opposite : direction))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (savingRef.current) return
    setSubmitted(true)
    setSaveError('')
    const found = Object.keys(validate(values))
    if (found.length) {
      const first = found[0] === 'recipe-ingredients' ? lineId(lines[0], 'name') : found[0]
      focusSoon(first)
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const result = await onSave(values)
      if (result?.error) setSaveError(result.error)
    } catch (error) {
      console.error(error)
      setSaveError('Couldn’t save. Try again.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const field = (key) => describedBy(`recipe-${key}`, errors[`recipe-${key}`])

  return (
    <form className="recipe-form" noValidate onSubmit={handleSubmit}>
      <section className="panel form-section" aria-labelledby="recipe-basics-title">
        <h2 className="form-section-title" id="recipe-basics-title">Basics</h2>
        <div className="form-stack">
          <fieldset className="form-choice">
            <legend>Type</legend>
            <div className="form-choice-options">
              {CATEGORIES.map((category) => (
                <span key={category.id}>
                  <input
                    className="sr-only"
                    type="radio"
                    id={`recipe-category-${category.id}`}
                    name="category"
                    value={category.id}
                    checked={values.category === category.id}
                    onChange={set('category')}
                  />
                  <label className="filter-chip" htmlFor={`recipe-category-${category.id}`}>{category.label}</label>
                </span>
              ))}
            </div>
          </fieldset>
          <div className="form-field">
            <label htmlFor="recipe-title">Title</label>
            <input className="form-input" type="text" maxLength={120} autoComplete="off" required value={values.title} onChange={set('title')} {...field('title')} />
            <FieldError id="recipe-title" error={errors['recipe-title']} />
          </div>
          <div className="form-field">
            <label htmlFor="recipe-description">Description <Optional /></label>
            <textarea className="form-input" rows={2} maxLength={500} value={values.description} onChange={set('description')} {...field('description')} />
          </div>
          <div className="form-field">
            <label htmlFor="recipe-image_url">Photo URL <Optional /></label>
            <input className="form-input" type="url" inputMode="url" maxLength={2000} placeholder="https://" autoComplete="off" value={values.image_url} onChange={set('image_url')} {...field('image_url')} />
            <FieldError id="recipe-image_url" error={errors['recipe-image_url']} />
          </div>
        </div>
      </section>

      {creami && (
        <section className="panel form-section" aria-labelledby="recipe-machine-title">
          <h2 className="form-section-title" id="recipe-machine-title">Machine</h2>
          <div className="form-grid form-grid-3">
            <fieldset className="form-choice">
              <legend>Tub size</legend>
              <div className="form-choice-options">
                {['16', '24'].map((size) => (
                  <span key={size}>
                    <input
                      className="sr-only"
                      type="radio"
                      id={`recipe-tub-${size}`}
                      name="tub_size_oz"
                      value={size}
                      checked={values.tub_size_oz === size}
                      onChange={set('tub_size_oz')}
                    />
                    <label className="filter-chip" htmlFor={`recipe-tub-${size}`}>{size} oz</label>
                  </span>
                ))}
              </div>
            </fieldset>
            <div className="form-field">
              <label htmlFor="recipe-program">Program</label>
              <select className="form-input" required value={values.program} onChange={set('program')} {...field('program')}>
                <option value="">Choose…</option>
                {PROGRAM_IDS.map((id) => <option key={id} value={id}>{PROGRAM_NAMES[id]}</option>)}
              </select>
              <FieldError id="recipe-program" error={errors['recipe-program']} />
            </div>
            <div className="form-field">
              <label htmlFor="recipe-freeze_time_hours">Freeze time</label>
              <div className="number-field">
                <input type="number" inputMode="decimal" min="1" max="168" step="any" required value={values.freeze_time_hours} onChange={set('freeze_time_hours')} {...field('freeze_time_hours')} />
                <span aria-hidden="true">hours</span>
              </div>
              <FieldError id="recipe-freeze_time_hours" error={errors['recipe-freeze_time_hours']} />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="recipe-freeze_note">Freeze note <Optional /></label>
              <input className="form-input" type="text" maxLength={300} autoComplete="off" value={values.freeze_note} onChange={set('freeze_note')} {...field('freeze_note')} />
            </div>
            <div className="form-field">
              <label htmlFor="recipe-respin_note">Re-spin note <Optional /></label>
              <input className="form-input" type="text" maxLength={300} autoComplete="off" value={values.respin_note} onChange={set('respin_note')} {...field('respin_note')} />
            </div>
          </div>
        </section>
      )}

      <section className="panel form-section" aria-labelledby="recipe-nutrition-title">
        <h2 className="form-section-title" id="recipe-nutrition-title">Nutrition per {getCategory(values.category).serving}</h2>
        <div className="form-grid form-grid-4">
          {NUTRITION.map(({ key, label, unit, max }) => (
            <div className="form-field" key={key}>
              <label htmlFor={`recipe-${key}`}>{label}</label>
              <div className="number-field">
                <input type="number" inputMode="decimal" min="0" max={max} step="any" required value={values[key]} onChange={set(key)} {...field(key)} />
                <span aria-hidden="true">{unit}</span>
              </div>
              <FieldError id={`recipe-${key}`} error={errors[`recipe-${key}`]} />
            </div>
          ))}
        </div>
      </section>

      <section className="panel form-section" aria-labelledby="recipe-ingredients-title">
        <h2 className="form-section-title" id="recipe-ingredients-title">Ingredients</h2>
        <ol className="form-lines">
          {lines.map((line, index) => {
            const nameId = lineId(line, 'name')
            const amountId = lineId(line, 'amount')
            const unitId = lineId(line, 'unit')
            const label = line.name.trim() || `ingredient ${index + 1}`
            const groupError = index === 0 && errors['recipe-ingredients'] ? 'recipe-ingredients-error' : undefined
            return (
              <li className="form-line" key={line.key}>
                <div className="form-line-name">
                  <label className="sr-only" htmlFor={nameId}>Ingredient {index + 1}</label>
                  <input
                    className="form-input"
                    type="text"
                    maxLength={100}
                    placeholder="Ingredient"
                    autoComplete="off"
                    value={line.name}
                    onChange={(event) => setLine(line.key, 'name', event.target.value)}
                    {...describedBy(nameId, errors[nameId], groupError)}
                  />
                  <FieldError id={nameId} error={errors[nameId]} />
                </div>
                <div className="form-line-amount">
                  <label className="sr-only" htmlFor={amountId}>Amount for {label}</label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    placeholder="Amount"
                    value={line.amount}
                    onChange={(event) => setLine(line.key, 'amount', event.target.value)}
                    {...describedBy(amountId, errors[amountId])}
                  />
                  <FieldError id={amountId} error={errors[amountId]} />
                </div>
                <div className="form-line-unit">
                  <label className="sr-only" htmlFor={unitId}>Unit for {label}</label>
                  <select className="form-input" id={unitId} value={line.unit} onChange={(event) => setLine(line.key, 'unit', event.target.value)}>
                    {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </div>
                <div className="form-line-tools">
                  <button type="button" id={lineId(line, 'up')} onClick={() => moveLine(index, -1)} disabled={index === 0} aria-label={`Move ${label} up`}>
                    <span aria-hidden="true">↑</span>
                  </button>
                  <button type="button" id={lineId(line, 'down')} onClick={() => moveLine(index, 1)} disabled={index === lines.length - 1} aria-label={`Move ${label} down`}>
                    <span aria-hidden="true">↓</span>
                  </button>
                  <button type="button" onClick={() => removeLine(index)} disabled={lines.length <= 1} aria-label={`Remove ${label}`}>
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
        {errors['recipe-ingredients'] && <p className="field-error" id="recipe-ingredients-error">{errors['recipe-ingredients']}</p>}
        <button type="button" className="form-quiet-button" onClick={addLine} disabled={lines.length >= MAX_INGREDIENTS}>
          <span aria-hidden="true">+</span> Add ingredient
        </button>
      </section>

      <section className="panel form-section" aria-labelledby="recipe-steps-title">
        <h2 className="form-section-title" id="recipe-steps-title">Steps</h2>
        <label className="sr-only" htmlFor="recipe-steps">Steps, one per line</label>
        <textarea className="form-input" rows={6} placeholder="One step per line" value={values.steps} onChange={set('steps')} {...field('steps')} />
        <FieldError id="recipe-steps" error={errors['recipe-steps']} />
      </section>

      <div className="form-actions">
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        <button type="submit" className="button button-primary" aria-disabled={saving || undefined}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        <Link className="text-link" to={cancelTo}>Cancel</Link>
      </div>
    </form>
  )
}

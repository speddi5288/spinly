import { INGREDIENTS } from './ingredients.js'
import { gramsFor } from './units.js'

export const NUTRIENT_KEYS = ['kcal', 'protein', 'fat', 'carbs', 'fiber', 'sugars']

const LABELS = { kcal: 'calories', protein: 'protein', fat: 'fat', carbs: 'carbs', fiber: 'fiber', sugars: 'sugars' }

/**
 * Adds up USDA values for every non-optional line that maps to a catalog ingredient.
 * Returns the totals for the whole tub plus notes about values USDA doesn't report.
 */
export function recipeNutrition(ingredients) {
  const total = { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugars: 0 }
  const unreported = []
  for (const line of ingredients) {
    if (line.optional) continue
    const ingredient = INGREDIENTS[line.ingredientId]
    if (!ingredient) continue
    const grams = gramsFor(line, ingredient)
    for (const key of NUTRIENT_KEYS) total[key] += (grams * ingredient.per100g[key]) / 100
    for (const key of ingredient.unreported ?? []) unreported.push(`${LABELS[key]} in ${ingredient.name}`)
  }
  return { total, unreported }
}

export function roundNutrients(n) {
  return Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, Math.round(n[key])]))
}

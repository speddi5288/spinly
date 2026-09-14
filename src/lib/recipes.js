import { starterRecipes } from '../data/starterRecipes.js'
import { INGREDIENTS, findIngredientByName } from './ingredients.js'
import { PROGRAM_NAMES, programIdFromName } from './machines.js'
import { recipeNutrition, roundNutrients } from './nutrition.js'

/*
 * Every recipe in the UI has this normalized shape, whether it ships with the app
 * ("starter") or was submitted to Supabase ("community"):
 *
 * {
 *   id, source: 'starter' | 'community', user_id, created_at,
 *   title, description, image_url, image_alt,
 *   tub_size_oz,                      // amounts and nutrition are written for this tub
 *   programs: [programId, ...],       // preference order; programs[0] is the first choice
 *   program,                          // display name of programs[0]
 *   respins, mix_in, prep_minutes,
 *   freeze_time_hours, freeze_note, respin_note,
 *   calories, protein, carbs, fat,    // whole tub, rounded
 *   fiber, sugars,                    // whole tub, or null for community recipes
 *   nutrition_source: 'usda' | 'user',
 *   nutrition_notes: [string],        // e.g. "sugars in fresh mint leaves" not reported by USDA
 *   ingredients: [{ ingredientId, name, amount, unit, prep, section, optional }],
 *   steps: [string],                  // may contain {program}
 *   tested,
 * }
 */

export function normalizeStarter(raw) {
  const ingredients = raw.ingredients.map((line) => ({
    ingredientId: line.ingredientId,
    name: INGREDIENTS[line.ingredientId].name,
    amount: line.amount,
    unit: line.unit,
    prep: line.prep ?? '',
    section: line.section ?? 'base',
    optional: Boolean(line.optional),
  }))
  const { total, unreported } = recipeNutrition(ingredients)
  const n = roundNutrients(total)
  return {
    id: raw.id,
    source: 'starter',
    user_id: null,
    created_at: raw.created_at,
    title: raw.title,
    description: raw.description,
    image_url: raw.image_url ?? null,
    image_alt: raw.image_alt ?? raw.title,
    tub_size_oz: 16,
    programs: raw.programs,
    program: PROGRAM_NAMES[raw.programs[0]],
    respins: raw.respins,
    mix_in: raw.mix_in,
    prep_minutes: raw.prep_minutes,
    freeze_time_hours: 24,
    freeze_note: '',
    respin_note: '',
    calories: n.kcal,
    protein: n.protein,
    carbs: n.carbs,
    fat: n.fat,
    fiber: n.fiber,
    sugars: n.sugars,
    nutrition_source: 'usda',
    nutrition_notes: unreported,
    ingredients,
    steps: raw.steps,
    tested: raw.tested,
  }
}

/** A row from the Supabase `recipes` table, normalized. */
export function fromRow(row) {
  const programId = programIdFromName(row.program) ?? 'ice_cream'
  return {
    id: row.id,
    source: 'community',
    user_id: row.user_id,
    created_at: row.created_at,
    title: row.title,
    description: row.description ?? '',
    image_url: row.image_url || null,
    image_alt: row.title,
    tub_size_oz: Number(row.tub_size_oz) || 16,
    programs: [programId],
    program: PROGRAM_NAMES[programId],
    respins: row.respin_note ? 1 : 0,
    mix_in: false,
    prep_minutes: null,
    freeze_time_hours: Number(row.freeze_time_hours) || 24,
    freeze_note: row.freeze_note ?? '',
    respin_note: row.respin_note ?? '',
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    fiber: null,
    sugars: null,
    nutrition_source: 'user',
    nutrition_notes: [],
    ingredients: (row.ingredients ?? []).map((line) => ({
      ingredientId: findIngredientByName(line.name)?.id ?? null,
      name: line.name,
      amount: Number(line.amount),
      unit: line.unit,
      prep: '',
      section: 'base',
      optional: false,
    })),
    steps: row.steps ?? [],
    tested: true,
  }
}

/** Form values → a Supabase `recipes` row (without id/user_id/created_at). */
export function toRow(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim() || null,
    tub_size_oz: Number(values.tub_size_oz),
    program: values.program,
    freeze_time_hours: Number(values.freeze_time_hours),
    freeze_note: values.freeze_note.trim(),
    respin_note: values.respin_note.trim(),
    calories: Number(values.calories),
    protein: Number(values.protein),
    carbs: Number(values.carbs),
    fat: Number(values.fat),
    ingredients: values.ingredients
      .filter((line) => line.name.trim())
      .map((line) => ({ name: line.name.trim(), amount: Number(line.amount), unit: line.unit })),
    steps: values.steps.split('\n').map((step) => step.trim()).filter(Boolean),
  }
}

export const STARTER_RECIPES = starterRecipes.map(normalizeStarter)

export function getStarterRecipe(id) {
  return STARTER_RECIPES.find((recipe) => recipe.id === id) ?? null
}

export function readNutritionLimit(value) {
  if (value === '' || value == null) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function selectRecipes(recipes, filters = {}, sort = 'newest') {
  const maxCalories = readNutritionLimit(filters.maxCalories)
  const minProtein = readNutritionLimit(filters.minProtein)
  const maxCarbs = readNutritionLimit(filters.maxCarbs)

  return recipes.filter((recipe) => (
    (!filters.under300 || recipe.calories < 300)
    && (maxCalories === null || recipe.calories <= maxCalories)
    && (minProtein === null || recipe.protein >= minProtein)
    && (maxCarbs === null || recipe.carbs <= maxCarbs)
  )).sort((a, b) => {
    const newestFirst = Date.parse(b.created_at) - Date.parse(a.created_at)
    if (sort === 'protein_desc') return b.protein - a.protein || newestFirst
    if (sort === 'calories_asc') return a.calories - b.calories || newestFirst
    return newestFirst
  })
}

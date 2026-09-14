import { starterRecipes } from '../data/starterRecipes.js'
import { isCategoryId } from './categories.js'
import { INGREDIENTS, findIngredientByName } from './ingredients.js'
import { PROGRAM_NAMES, programIdFromName } from './machines.js'
import { recipeNutrition, roundNutrients } from './nutrition.js'
import { compareByRating } from './ratings.js'

/*
 * Every recipe in the UI has this normalized shape, whether it ships with the app
 * ("starter") or was submitted to Supabase ("community"):
 *
 * {
 *   id, source: 'starter' | 'community', user_id, created_at,
 *   category: 'creami' | 'bowl' | 'smoothie',
 *   title, description, image_url, image_alt,
 *   tub_size_oz,                      // CREAMi: amounts and nutrition are for this tub; otherwise null
 *   programs: [programId, ...],       // CREAMi: preference order, programs[0] first; otherwise []
 *   program,                          // display name of programs[0], or null
 *   respins, mix_in, prep_minutes,
 *   freeze_time_hours, freeze_note, respin_note,   // 0 / '' outside CREAMi
 *   calories, protein, carbs, fat,    // per tub (CREAMi) or per serving (bowl, smoothie), rounded
 *   fiber, sugars,                    // same, or null for community recipes
 *   nutrition_source: 'usda' | 'user',
 *   nutrition_notes: [string],        // e.g. "sugars in fresh mint leaves" not reported by USDA
 *   ingredients: [{ ingredientId, name, amount, unit, prep, section, optional }],
 *   steps: [string],                  // CREAMi steps may contain {program}
 *   tested,
 * }
 */

export function normalizeStarter(raw) {
  const category = isCategoryId(raw.category) ? raw.category : 'creami'
  const creami = category === 'creami'
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
    category,
    title: raw.title,
    description: raw.description,
    image_url: raw.image_url ?? null,
    image_alt: raw.image_alt ?? raw.title,
    tub_size_oz: creami ? 16 : null,
    programs: creami ? raw.programs : [],
    program: creami ? PROGRAM_NAMES[raw.programs[0]] : null,
    respins: creami ? raw.respins : 0,
    mix_in: creami ? raw.mix_in : false,
    prep_minutes: raw.prep_minutes ?? null,
    freeze_time_hours: creami ? 24 : 0,
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
  const category = isCategoryId(row.category) ? row.category : 'creami'
  const creami = category === 'creami'
  const programId = creami ? (programIdFromName(row.program) ?? 'ice_cream') : null
  return {
    id: row.id,
    source: 'community',
    user_id: row.user_id,
    created_at: row.created_at,
    category,
    title: row.title,
    description: row.description ?? '',
    image_url: row.image_url || null,
    image_alt: row.title,
    tub_size_oz: creami ? Number(row.tub_size_oz) || 16 : null,
    programs: creami ? [programId] : [],
    program: creami ? PROGRAM_NAMES[programId] : null,
    respins: creami && row.respin_note ? 1 : 0,
    mix_in: false,
    prep_minutes: null,
    freeze_time_hours: creami ? Number(row.freeze_time_hours) || 24 : 0,
    freeze_note: creami ? row.freeze_note ?? '' : '',
    respin_note: creami ? row.respin_note ?? '' : '',
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
  const category = isCategoryId(values.category) ? values.category : 'creami'
  const creami = category === 'creami'
  return {
    category,
    title: values.title.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim() || null,
    tub_size_oz: creami ? Number(values.tub_size_oz) : null,
    program: creami ? values.program : null,
    freeze_time_hours: creami ? Number(values.freeze_time_hours) : null,
    freeze_note: creami ? values.freeze_note.trim() : '',
    respin_note: creami ? values.respin_note.trim() : '',
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

/** Filters and sorts. `ratings` is { [recipeId]: { average, count } } for the "rating_desc" sort. */
export function selectRecipes(recipes, filters = {}, sort = 'newest', ratings = {}) {
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
    if (sort === 'rating_desc') return compareByRating(a, b, ratings) || newestFirst
    return newestFirst
  })
}

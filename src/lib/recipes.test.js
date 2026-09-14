import assert from 'node:assert/strict'
import test from 'node:test'
import { starterRecipes } from '../data/starterRecipes.js'
import { findIngredientByName } from './ingredients.js'
import { recipeNutrition, roundNutrients } from './nutrition.js'
import { STARTER_RECIPES, getStarterRecipe, normalizeStarter, readNutritionLimit, selectRecipes } from './recipes.js'

const ids = (recipes) => recipes.map((recipe) => recipe.id)

function fixture(id, { calories = 200, protein = 10, carbs = 20, created_at = '2026-01-01T00:00:00Z' } = {}) {
  return { id, title: id, calories, protein, carbs, fat: 5, created_at }
}

// normalizeStarter

test('every starter normalizes with per-tub nutrition matching recipeNutrition, rounded', () => {
  assert.equal(STARTER_RECIPES.length, starterRecipes.length)
  for (const recipe of STARTER_RECIPES) {
    const n = roundNutrients(recipeNutrition(recipe.ingredients).total)
    assert.deepEqual(
      [recipe.calories, recipe.protein, recipe.carbs, recipe.fat, recipe.fiber, recipe.sugars],
      [n.kcal, n.protein, n.carbs, n.fat, n.fiber, n.sugars],
      recipe.id,
    )
    assert.ok(recipe.calories > 0, `${recipe.id} calories`)
    assert.ok(recipe.carbs > 0, `${recipe.id} carbs`)
    for (const key of ['protein', 'fat', 'fiber', 'sugars']) {
      assert.ok(Number.isInteger(recipe[key]) && recipe[key] >= 0, `${recipe.id} ${key}`)
    }
  }
})

test('Mango Lime Sorbet nutrition matches a hand calculation from USDA values', () => {
  // 2 cups mango (330 g), 2 tbsp lime juice (30.8 g), 2 tbsp sugar (25 g), 1/4 cup water.
  const mango = getStarterRecipe('mango-lime-sorbet')
  assert.equal(mango.calories, Math.round(330 * 0.60 + 30.8 * 0.25 + 25 * 3.87))
  assert.equal(mango.carbs, Math.round(330 * 0.15 + 30.8 * 0.0842 + 25 * 1))
  assert.equal(mango.protein, Math.round(330 * 0.0082 + 30.8 * 0.0042))
})

test('optional lines are listed but left out of nutrition', () => {
  const raw = starterRecipes.find((recipe) => recipe.ingredients.some((line) => line.optional))
  assert.ok(raw, 'expected a starter with an optional line')
  const withOptional = normalizeStarter(raw)
  const allRequired = normalizeStarter({ ...raw, ingredients: raw.ingredients.map((line) => ({ ...line, optional: false })) })
  const withoutOptional = normalizeStarter({ ...raw, ingredients: raw.ingredients.filter((line) => !line.optional) })

  assert.equal(withOptional.ingredients.length, raw.ingredients.length)
  assert.ok(withOptional.ingredients.some((line) => line.optional === true))
  assert.equal(withOptional.calories, withoutOptional.calories)
  assert.ok(allRequired.calories > withOptional.calories || allRequired.carbs > withOptional.carbs)

  const onlyOptional = normalizeStarter({ ...raw, ingredients: [{ ingredientId: 'sugar', amount: 1, unit: 'cup', optional: true }] })
  assert.equal(onlyOptional.calories, 0)
})

test('normalizeStarter fills the shared recipe shape and defaults', () => {
  const raw = starterRecipes.find((recipe) => recipe.id === 'blueberry-greek-froyo')
  const recipe = normalizeStarter(raw)
  assert.equal(recipe.source, 'starter')
  assert.equal(recipe.user_id, null)
  assert.equal(recipe.tub_size_oz, 16)
  assert.deepEqual(recipe.programs, ['frozen_yogurt', 'lite_ice_cream'])
  assert.equal(recipe.program, 'Frozen Yogurt')
  assert.equal(recipe.image_url, null)
  assert.equal(recipe.image_alt, raw.title)
  assert.equal(recipe.nutrition_source, 'usda')
  const first = recipe.ingredients[0]
  assert.deepEqual(first, { ingredientId: 'greek-yogurt-whole', name: 'whole-milk plain Greek yogurt', amount: 1, unit: 'cup', prep: '', section: 'base', optional: false })
})

test('nutrition notes carry values USDA does not report', () => {
  assert.deepEqual(getStarterRecipe('fresh-mint-chip-lite').nutrition_notes, ['sugars in fresh mint leaves'])
  assert.deepEqual(getStarterRecipe('mango-lime-sorbet').nutrition_notes, [])
})

test('getStarterRecipe finds by id and returns null otherwise', () => {
  assert.equal(getStarterRecipe(starterRecipes[0].id).title, starterRecipes[0].title)
  assert.equal(getStarterRecipe('nope'), null)
})

// readNutritionLimit

test('readNutritionLimit accepts zero and positive numbers only', () => {
  assert.equal(readNutritionLimit(''), null)
  assert.equal(readNutritionLimit(null), null)
  assert.equal(readNutritionLimit(undefined), null)
  assert.equal(readNutritionLimit('0'), 0)
  assert.equal(readNutritionLimit('12.5'), 12.5)
  assert.equal(readNutritionLimit(40), 40)
  assert.equal(readNutritionLimit('-1'), null)
  assert.equal(readNutritionLimit('abc'), null)
  assert.equal(readNutritionLimit('Infinity'), null)
})

// selectRecipes

test('Under 300 excludes exactly 300 while max calories includes its boundary', () => {
  const recipes = [fixture('a', { calories: 299 }), fixture('b', { calories: 300 }), fixture('c', { calories: 301 })]
  assert.deepEqual(ids(selectRecipes(recipes, { under300: true }, 'calories_asc')), ['a'])
  assert.deepEqual(ids(selectRecipes(recipes, { maxCalories: '300' }, 'calories_asc')), ['a', 'b'])
})

test('min protein and max carbs include their boundaries and zero is an active limit', () => {
  const recipes = [fixture('low', { protein: 9, carbs: 0 }), fixture('edge', { protein: 10, carbs: 20 }), fixture('high', { protein: 30, carbs: 21 })]
  assert.deepEqual(ids(selectRecipes(recipes, { minProtein: '10' }, 'protein_desc')), ['high', 'edge'])
  assert.deepEqual(ids(selectRecipes(recipes, { maxCarbs: '20' })).sort(), ['edge', 'low'])
  assert.deepEqual(ids(selectRecipes(recipes, { maxCarbs: '0' })), ['low'])
  assert.deepEqual(selectRecipes(recipes, { maxCalories: '0' }), [])
})

test('filters combine', () => {
  const recipes = [
    fixture('match', { calories: 250, protein: 30, carbs: 15 }),
    fixture('too-many-calories', { calories: 300, protein: 30, carbs: 15 }),
    fixture('too-little-protein', { calories: 250, protein: 20, carbs: 15 }),
    fixture('too-many-carbs', { calories: 250, protein: 30, carbs: 40 }),
  ]
  assert.deepEqual(ids(selectRecipes(recipes, { under300: true, maxCalories: '280', minProtein: '25', maxCarbs: '20' })), ['match'])
})

test('empty and invalid limits are ignored', () => {
  const recipes = [fixture('a'), fixture('b', { calories: 900 })]
  assert.equal(selectRecipes(recipes, { maxCalories: '', minProtein: '', maxCarbs: '' }).length, 2)
  assert.equal(selectRecipes(recipes, { maxCalories: '-1', minProtein: 'lots', maxCarbs: 'Infinity' }).length, 2)
  assert.equal(selectRecipes(recipes).length, 2)
})

test('sorts newest first, by protein, and by calories, breaking ties by newest', () => {
  const recipes = [
    fixture('old', { calories: 200, protein: 20, created_at: '2026-01-01T00:00:00Z' }),
    fixture('new', { calories: 200, protein: 20, created_at: '2026-03-01T00:00:00Z' }),
    fixture('mid', { calories: 100, protein: 40, created_at: '2026-02-01T00:00:00Z' }),
  ]
  assert.deepEqual(ids(selectRecipes(recipes)), ['new', 'mid', 'old'])
  assert.deepEqual(ids(selectRecipes(recipes, {}, 'unknown')), ['new', 'mid', 'old'])
  assert.deepEqual(ids(selectRecipes(recipes, {}, 'protein_desc')), ['mid', 'new', 'old'])
  assert.deepEqual(ids(selectRecipes(recipes, {}, 'calories_asc')), ['mid', 'new', 'old'])
})

test('selecting and sorting does not mutate the input', () => {
  const recipes = Object.freeze([fixture('a', { protein: 1 }), fixture('b', { protein: 50 })].map(Object.freeze))
  const result = selectRecipes(recipes, {}, 'protein_desc')
  assert.deepEqual(ids(result), ['b', 'a'])
  assert.deepEqual(ids(recipes), ['a', 'b'])
  assert.notEqual(result, recipes)
})

test('Under 300 on the starters keeps exactly the starters below 300 kcal', () => {
  const expected = STARTER_RECIPES.filter((recipe) => recipe.calories < 300).map((recipe) => recipe.id).sort()
  assert.deepEqual(ids(selectRecipes(STARTER_RECIPES, { under300: true })).sort(), expected)
})

// findIngredientByName

test('findIngredientByName matches free-text names to the catalog', () => {
  assert.equal(findIngredientByName('frozen mango chunks')?.id, 'mango')
  assert.equal(findIngredientByName('vanilla protein powder')?.id, 'whey')
  assert.equal(findIngredientByName('Heavy Whipping Cream')?.id, 'heavy-cream')
  assert.equal(findIngredientByName('2% milk')?.id, 'milk-2')
})

test('findIngredientByName keeps plant-based names away from dairy and returns null for no match', () => {
  assert.equal(findIngredientByName('oat milk'), null)
  assert.equal(findIngredientByName('almond milk')?.id, 'almond-milk')
  assert.equal(findIngredientByName('coconut yogurt'), null)
  assert.equal(findIngredientByName(''), null)
  assert.equal(findIngredientByName(null), null)
  assert.equal(findIngredientByName('dragon fruit'), null)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { getCategory, isCategoryId, servingLabel } from './categories.js'
import { compareByRating, formatAverage, isRating, statsFromPersonal, statsFromRows } from './ratings.js'
import { STARTER_RECIPES, selectRecipes } from './recipes.js'

test('isRating accepts whole stars from 1 to 5', () => {
  for (const value of [1, 3, 5]) assert.equal(isRating(value), true)
  for (const value of [0, 6, 2.5, '4', null, undefined]) assert.equal(isRating(value), false)
})

test('statsFromRows reads the rating stats function output and skips bad rows', () => {
  const stats = statsFromRows([
    { recipe_id: 'a', average: '4.50', count: '2' },
    { recipe_id: 'b', average: 3, count: 1 },
    { recipe_id: 'empty', average: null, count: 0 },
    { recipe_id: 7, average: 5, count: 1 },
  ])
  assert.deepEqual(stats, { a: { average: 4.5, count: 2 }, b: { average: 3, count: 1 } })
  assert.deepEqual(statsFromRows(null), {})
})

test('statsFromPersonal turns your ratings into single-vote stats', () => {
  assert.deepEqual(statsFromPersonal({ a: 5, b: 0 }), { a: { average: 5, count: 1 } })
  assert.deepEqual(statsFromPersonal(undefined), {})
})

test('formatAverage rounds to one decimal', () => {
  assert.equal(formatAverage(4), '4.0')
  assert.equal(formatAverage(4.44), '4.4')
  assert.equal(formatAverage(4.46), '4.5')
})

test('compareByRating ranks by average, then count, with unrated last', () => {
  const stats = { top: { average: 4.8, count: 3 }, tie: { average: 4.8, count: 10 }, low: { average: 2, count: 50 } }
  const ids = ['low', 'unrated', 'top', 'tie'].map((id) => ({ id }))
  assert.deepEqual(ids.sort((a, b) => compareByRating(a, b, stats)).map((r) => r.id), ['tie', 'top', 'low', 'unrated'])
})

test('selectRecipes sorts by rating and breaks ties by newest', () => {
  const recipes = [
    { id: 'old', calories: 1, protein: 1, carbs: 1, created_at: '2026-01-01T00:00:00Z' },
    { id: 'new', calories: 1, protein: 1, carbs: 1, created_at: '2026-03-01T00:00:00Z' },
    { id: 'rated', calories: 1, protein: 1, carbs: 1, created_at: '2026-02-01T00:00:00Z' },
  ]
  const sorted = selectRecipes(recipes, {}, 'rating_desc', { rated: { average: 3, count: 1 } })
  assert.deepEqual(sorted.map((r) => r.id), ['rated', 'new', 'old'])
})

test('categories resolve and label servings', () => {
  assert.equal(isCategoryId('bowl'), true)
  assert.equal(isCategoryId('pizza'), false)
  assert.equal(getCategory('smoothie').path, '/smoothies')
  assert.equal(getCategory('pizza').id, 'creami')
  assert.equal(servingLabel({ category: 'creami', tub_size_oz: 16 }), 'Per 16 oz tub')
  assert.equal(servingLabel({ category: 'creami', tub_size_oz: 16 }, 24), 'Per 24 oz tub')
  assert.equal(servingLabel({ category: 'bowl' }), 'Per bowl')
})

test('bowl and smoothie starters normalize without machine fields', () => {
  for (const recipe of STARTER_RECIPES.filter((r) => r.category !== 'creami')) {
    assert.deepEqual(recipe.programs, [], recipe.id)
    assert.equal(recipe.program, null, recipe.id)
    assert.equal(recipe.tub_size_oz, null, recipe.id)
    assert.equal(recipe.freeze_time_hours, 0, recipe.id)
    assert.ok(recipe.calories > 0, recipe.id)
  }
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { sampleRecipes } from '../data/sampleRecipes.js'
import { selectRecipes } from './recipes.js'

const ids = (recipes) => recipes.map((recipe) => recipe.id)

test('Under 300 excludes exactly 300; maximum calories includes its boundary', () => {
  assert.deepEqual(ids(selectRecipes(sampleRecipes, { under300: true }, 'calories_asc')),
    ['mango-sorbet', 'vanilla-bean', 'mint-chip', 'double-chocolate'])
  assert.ok(ids(selectRecipes(sampleRecipes, { maxCalories: '300' })).includes('strawberry-cheesecake'))
})

test('all nutrition filters combine, including equality at minimum and maximum', () => {
  assert.deepEqual(ids(selectRecipes(sampleRecipes, { under300: true, maxCalories: '280', minProtein: '30', maxCarbs: '22' })), ['mint-chip'])
  assert.deepEqual(selectRecipes(sampleRecipes, { minProtein: '50' }), [])
})

test('clearing limits restores all recipes and zero is an active limit', () => {
  assert.equal(selectRecipes(sampleRecipes, { maxCalories: '', minProtein: '', maxCarbs: '' }).length, 6)
  assert.deepEqual(selectRecipes(sampleRecipes, { maxCalories: '0' }), [])
  assert.deepEqual(selectRecipes(sampleRecipes, { maxCarbs: '0' }), [])
  assert.equal(selectRecipes(sampleRecipes, { minProtein: '0' }).length, 6)
})

test('newest, highest protein, and lowest calories produce the expected orders', () => {
  assert.deepEqual(ids(selectRecipes(sampleRecipes)), ['strawberry-cheesecake', 'double-chocolate', 'mango-sorbet', 'mint-chip', 'peanut-butter', 'vanilla-bean'])
  assert.deepEqual(ids(selectRecipes(sampleRecipes, {}, 'protein_desc')), ['peanut-butter', 'double-chocolate', 'mint-chip', 'vanilla-bean', 'strawberry-cheesecake', 'mango-sorbet'])
  assert.deepEqual(ids(selectRecipes(sampleRecipes, {}, 'calories_asc')), ['mango-sorbet', 'vanilla-bean', 'mint-chip', 'double-chocolate', 'strawberry-cheesecake', 'peanut-butter'])
})

test('decimal thresholds work and invalid limits do not hide the collection', () => {
  assert.deepEqual(ids(selectRecipes(sampleRecipes, { maxCalories: '299.5', minProtein: '34.5' })), ['double-chocolate'])
  assert.equal(selectRecipes(sampleRecipes, { maxCalories: '-1', minProtein: 'invalid', maxCarbs: 'Infinity' }).length, 6)
})

test('switching sorts does not mutate the source collection', () => {
  const frozenRecipes = Object.freeze(sampleRecipes.map((recipe) => Object.freeze({ ...recipe })))
  const before = ids(frozenRecipes)
  selectRecipes(frozenRecipes, {}, 'protein_desc')
  assert.deepEqual(ids(frozenRecipes), before)
})

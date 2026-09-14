import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { CATEGORY_IDS } from './categories.js'
import { findIngredientByName } from './ingredients.js'
import { PROGRAM_IDS } from './machines.js'
import { fromRow, toRow } from './recipes.js'
import { UNITS } from './units.js'

function formValues(changes = {}) {
  return {
    category: 'creami',
    title: '  Mango Lime Sorbet ',
    description: ' Bright and tart. ',
    image_url: '  ',
    tub_size_oz: '24',
    program: 'lite_ice_cream',
    freeze_time_hours: '18',
    freeze_note: ' Freeze flat. ',
    respin_note: '',
    calories: '320',
    protein: '4.5',
    carbs: '78',
    fat: '0',
    ingredients: [
      { key: 'a', name: ' frozen mango ', amount: '2', unit: 'cup' },
      { key: 'b', name: '', amount: '', unit: 'cup' },
      { key: 'c', name: 'oat milk', amount: '0.5', unit: 'cup' },
      { key: 'd', name: 'lime juice', amount: '2', unit: 'tbsp' },
    ],
    steps: 'Blend everything.\n\n   Pour into the tub and freeze.  \n\nSpin on {program}.\n',
    ...changes,
  }
}

// What Supabase hands back after an insert: defaults filled in, JSON round-tripped.
function fakeDbRow(row) {
  return JSON.parse(JSON.stringify({
    id: '6f1c2b0e-4a57-4c3e-9d1a-0b8f2a3c4d5e',
    user_id: '0b2f7e4c-8d19-4f6a-b1c3-5e7d9a2b4c6f',
    created_at: '2026-09-13T20:00:00+00:00',
    ...row,
  }))
}

test('toRow trims text, drops blank ingredient rows and blank step lines', () => {
  const row = toRow(formValues())
  assert.equal(row.category, 'creami')
  assert.equal(row.title, 'Mango Lime Sorbet')
  assert.equal(row.description, 'Bright and tart.')
  assert.equal(row.image_url, null)
  assert.equal(row.tub_size_oz, 24)
  assert.equal(row.freeze_time_hours, 18)
  assert.equal(row.freeze_note, 'Freeze flat.')
  assert.deepEqual([row.calories, row.protein, row.carbs, row.fat], [320, 4.5, 78, 0])
  assert.deepEqual(row.ingredients, [
    { name: 'frozen mango', amount: 2, unit: 'cup' },
    { name: 'oat milk', amount: 0.5, unit: 'cup' },
    { name: 'lime juice', amount: 2, unit: 'tbsp' },
  ])
  assert.deepEqual(row.steps, ['Blend everything.', 'Pour into the tub and freeze.', 'Spin on {program}.'])
  assert.equal('id' in row || 'user_id' in row || 'created_at' in row, false)
})

test('toRow → database row → fromRow keeps order and maps the program', () => {
  const recipe = fromRow(fakeDbRow(toRow(formValues())))
  assert.equal(recipe.source, 'community')
  assert.equal(recipe.category, 'creami')
  assert.equal(recipe.title, 'Mango Lime Sorbet')
  assert.equal(recipe.tub_size_oz, 24)
  assert.deepEqual(recipe.programs, ['lite_ice_cream'])
  assert.equal(recipe.program, 'Lite Ice Cream')
  assert.equal(recipe.freeze_time_hours, 18)
  assert.equal(recipe.image_url, null)
  assert.deepEqual(recipe.ingredients.map(({ name, amount, unit }) => [name, amount, unit]), [
    ['frozen mango', 2, 'cup'],
    ['oat milk', 0.5, 'cup'],
    ['lime juice', 2, 'tbsp'],
  ])
  assert.deepEqual(recipe.steps, ['Blend everything.', 'Pour into the tub and freeze.', 'Spin on {program}.'])
  assert.deepEqual([recipe.calories, recipe.protein, recipe.carbs, recipe.fat], [320, 4.5, 78, 0])
})

test('bowls and smoothies store no machine fields and come back without them', () => {
  const row = toRow(formValues({ category: 'smoothie', freeze_note: 'ignored', respin_note: 'ignored' }))
  assert.equal(row.category, 'smoothie')
  assert.deepEqual([row.tub_size_oz, row.program, row.freeze_time_hours, row.freeze_note, row.respin_note], [null, null, null, '', ''])

  const recipe = fromRow(fakeDbRow(row))
  assert.equal(recipe.category, 'smoothie')
  assert.deepEqual(recipe.programs, [])
  assert.equal(recipe.program, null)
  assert.equal(recipe.tub_size_oz, null)
  assert.equal(recipe.freeze_time_hours, 0)
  assert.equal(recipe.respins, 0)
})

test('fromRow accepts program display names, falls back for unknown ones, and defaults the category', () => {
  const row = fakeDbRow(toRow(formValues()))
  assert.deepEqual(fromRow({ ...row, program: 'Sorbet' }).programs, ['sorbet'])
  assert.deepEqual(fromRow({ ...row, program: 'mystery' }).programs, ['ice_cream'])
  const { category: _omit, ...legacy } = row
  assert.equal(fromRow(legacy).category, 'creami')
  assert.equal(fromRow({ ...row, category: 'pizza' }).category, 'creami')
})

test('community ingredients link to the catalog by name', () => {
  const recipe = fromRow(fakeDbRow(toRow(formValues())))
  assert.equal(recipe.ingredients[0].ingredientId, 'mango')
  assert.equal(recipe.ingredients[1].ingredientId, null)
  assert.equal(findIngredientByName('frozen mango')?.id, 'mango')
  assert.equal(findIngredientByName('oat milk'), null)
  assert.equal(findIngredientByName('almond milk')?.id, 'almond-milk')
})

test('schema.sql allows exactly the app’s categories, programs, and units', () => {
  const sql = readFileSync(new URL('../../supabase/schema.sql', import.meta.url), 'utf8')
  const listAfter = (marker) => {
    const match = sql.match(new RegExp(`${marker} in \\(([^)]*)\\)`))
    assert.ok(match, `missing list after ${marker}`)
    return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  }
  assert.deepEqual(listAfter('category'), CATEGORY_IDS)
  assert.deepEqual(listAfter('program'), PROGRAM_IDS)
  assert.deepEqual(listAfter("\\(item ->> 'unit'\\) not"), UNITS)
})

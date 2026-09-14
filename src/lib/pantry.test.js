import assert from 'node:assert/strict'
import test from 'node:test'
import { matchPantry, requiredIngredientIds } from './pantry.js'
import { STARTER_RECIPES, getStarterRecipe } from './recipes.js'

function recipe(title, lines) {
  return { id: title.toLowerCase(), title, ingredients: lines.map((line) => (typeof line === 'string' ? { ingredientId: line, optional: false } : line)) }
}

test('requiredIngredientIds skips optional lines, staples, free text, and duplicates', () => {
  const r = recipe('Test', [
    'milk-2',
    'sugar',
    'milk-2',
    'salt',
    'water',
    { ingredientId: 'guar-gum', optional: true },
    { ingredientId: null, name: 'oat milk', optional: false },
  ])
  assert.deepEqual(requiredIngredientIds(r), ['milk-2', 'sugar'])
})

test('requiredIngredientIds on a starter leaves out its staples', () => {
  assert.deepEqual(requiredIngredientIds(getStarterRecipe('mango-lime-sorbet')), ['mango', 'lime-juice', 'sugar'])
})

test('an empty pantry matches nothing', () => {
  assert.deepEqual(matchPantry(STARTER_RECIPES, []), [])
})

test('recipes with nothing in the pantry are left out', () => {
  const matches = matchPantry([recipe('Milk', ['milk-2']), recipe('Mango', ['mango'])], ['mango'])
  assert.deepEqual(matches.map((m) => m.recipe.title), ['Mango'])
  assert.deepEqual(matches[0], { recipe: matches[0].recipe, have: ['mango'], missing: [], unknown: 0 })
})

test('matches rank by fewest missing (including unknown lines), then most owned, then title', () => {
  const recipes = [
    recipe('Two missing', ['milk-2', 'sugar', 'cocoa']),
    recipe('Unknown line', ['milk-2', { ingredientId: null, name: 'oat milk', optional: false }]),
    recipe('Zebra', ['milk-2']),
    recipe('Apple', ['milk-2']),
    recipe('Complete', ['milk-2', 'vanilla']),
  ]
  const matches = matchPantry(recipes, ['milk-2', 'vanilla'])
  assert.deepEqual(matches.map((m) => m.recipe.title), ['Complete', 'Apple', 'Zebra', 'Unknown line', 'Two missing'])
  assert.equal(matches.find((m) => m.recipe.title === 'Unknown line').unknown, 1)
  assert.deepEqual(matches.at(-1).missing, ['sugar', 'cocoa'])
})

test('a pantry holding every required ingredient ranks that starter first', () => {
  const target = getStarterRecipe('mango-lime-sorbet')
  const [best] = matchPantry(STARTER_RECIPES, requiredIngredientIds(target))
  assert.equal(best.recipe.id, target.id)
  assert.deepEqual(best.missing, [])
})

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { INGREDIENTS } from '../lib/ingredients.js'
import { isProgramId } from '../lib/machines.js'
import { UNITS } from '../lib/units.js'
import { starterRecipes } from './starterRecipes.js'

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

test('there are starter recipes to show', () => {
  assert.ok(starterRecipes.length > 0)
})

test('every starter has a unique slug id', () => {
  const ids = starterRecipes.map((recipe) => recipe.id)
  for (const id of ids) assert.match(id, SLUG)
  assert.equal(new Set(ids).size, ids.length)
})

test('every starter has a title, description, and a parseable created_at', () => {
  for (const recipe of starterRecipes) {
    assert.ok(recipe.title.trim(), recipe.id)
    assert.ok(recipe.description.trim(), recipe.id)
    assert.ok(Number.isFinite(Date.parse(recipe.created_at)), `${recipe.id} created_at`)
  }
})

test('every ingredient line maps to the catalog with a known unit and a gram weight', () => {
  for (const recipe of starterRecipes) {
    assert.ok(recipe.ingredients.length > 0, recipe.id)
    for (const line of recipe.ingredients) {
      const where = `${recipe.id} / ${line.ingredientId}`
      const ingredient = INGREDIENTS[line.ingredientId]
      assert.ok(ingredient, `${where}: not in INGREDIENTS`)
      assert.ok(UNITS.includes(line.unit), `${where}: unknown unit "${line.unit}"`)
      assert.ok(typeof line.amount === 'number' && line.amount > 0, `${where}: amount`)
      if (line.unit !== 'g' && line.unit !== 'oz') {
        assert.ok(ingredient.grams[line.unit] > 0, `${where}: no gram weight for "${line.unit}"`)
      }
    }
  }
})

test('whole-unit lines use ingredients with singular and plural labels', () => {
  for (const recipe of starterRecipes) {
    for (const line of recipe.ingredients.filter((l) => l.unit === 'whole')) {
      const { whole } = INGREDIENTS[line.ingredientId]
      assert.ok(whole?.singular && whole?.plural, `${recipe.id} / ${line.ingredientId}`)
    }
  }
})

test('programs are non-empty lists of valid program ids', () => {
  for (const recipe of starterRecipes) {
    assert.ok(recipe.programs.length > 0, recipe.id)
    for (const program of recipe.programs) assert.ok(isProgramId(program), `${recipe.id}: ${program}`)
    assert.equal(new Set(recipe.programs).size, recipe.programs.length, `${recipe.id}: duplicate program`)
  }
})

test('every recipe has a step that names the {program} to run', () => {
  for (const recipe of starterRecipes) {
    assert.ok(recipe.steps.some((step) => step.includes('{program}')), recipe.id)
  }
})

test('mix_in is true exactly when a line is in the mix-in section', () => {
  for (const recipe of starterRecipes) {
    const hasMixIn = recipe.ingredients.some((line) => line.section === 'mix-in')
    assert.equal(recipe.mix_in, hasMixIn, recipe.id)
  }
})

test('each image_url points at a file under public/', () => {
  for (const recipe of starterRecipes.filter((r) => r.image_url)) {
    assert.ok(recipe.image_url.startsWith('/'), recipe.id)
    const file = fileURLToPath(new URL(`../../public${recipe.image_url}`, import.meta.url))
    assert.ok(existsSync(file), `${recipe.id}: missing ${file}`)
    assert.ok(recipe.image_alt?.trim(), `${recipe.id}: image_alt`)
  }
})

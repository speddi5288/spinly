import assert from 'node:assert/strict'
import test from 'node:test'
import { INGREDIENTS } from './ingredients.js'
import { UNITS, formatAmount, formatGrams, formatLine, gramsFor, roundToFraction } from './units.js'

const line = (ingredientId, amount, unit) => ({ ingredientId, name: INGREDIENTS[ingredientId].name, amount, unit })
const show = (ingredientId, amount, unit, scale = 1, system = 'us') => formatLine(line(ingredientId, amount, unit), INGREDIENTS[ingredientId], scale, system)
const CUP = [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4]

test('roundToFraction uses kitchen fraction glyphs', () => {
  assert.deepEqual(roundToFraction(0.75, CUP), ['¾', 0.75])
  assert.deepEqual(roundToFraction(1 / 3, CUP), ['⅓', 1 / 3])
  assert.deepEqual(roundToFraction(1.5, CUP), ['1 ½', 1.5])
  assert.deepEqual(roundToFraction(2 / 3, CUP), ['⅔', 2 / 3])
  assert.equal(formatAmount(0.125, [1 / 8, 1 / 4]), '⅛')
})

test('roundToFraction rounds to the nearest step and never rounds to nothing', () => {
  assert.deepEqual(roundToFraction(0.95, CUP), ['1', 1])
  assert.deepEqual(roundToFraction(2.3, CUP), ['2 ⅓', 2 + 1 / 3])
  assert.deepEqual(roundToFraction(0.01, CUP), ['¼', 0.25])
  assert.deepEqual(roundToFraction(0.2, []), ['1', 1])
})

test('US volumes show cups, tbsp, and tsp with fractions', () => {
  assert.deepEqual(show('milk-2', 0.75, 'cup'), { amount: '¾ cup', label: '2% milk' })
  assert.equal(show('sugar', 1 / 3, 'cup').amount, '⅓ cup')
  assert.equal(show('milk-2', 1.5, 'cup').amount, '1 ½ cups')
  assert.equal(show('maple-syrup', 1, 'tbsp').amount, '1 tbsp')
  assert.equal(show('vanilla', 0.5, 'tsp').amount, '½ tsp')
})

test('scaling moves between cups, tbsp, and tsp', () => {
  assert.equal(show('maple-syrup', 2, 'tbsp', 2).amount, '¼ cup')
  assert.equal(show('maple-syrup', 1, 'tbsp', 0.5).amount, '1 ½ tsp')
  assert.equal(show('sugar', 0.25, 'cup', 0.5).amount, '2 tbsp')
  assert.equal(show('milk-2', 1, 'cup', 1.5).amount, '1 ½ cups')
})

test('metric shows liquids in ml and solids with a gram weight in g', () => {
  assert.equal(show('milk-2', 1, 'cup', 1, 'metric').amount, '235 ml')
  assert.equal(show('vanilla', 0.5, 'tsp', 1, 'metric').amount, '2.5 ml')
  assert.equal(show('sugar', 1 / 3, 'cup', 1, 'metric').amount, '67 g')
  assert.equal(show('cocoa', 2, 'tbsp', 1, 'metric').amount, '11 g')
  // A solid without a weight for this unit falls back to ml.
  assert.equal(show('mango', 1, 'tbsp', 1, 'metric').amount, '15 ml')
})

test('whole items are singular or plural after rounding to halves', () => {
  assert.deepEqual(show('egg-yolk', 1, 'whole'), { amount: '1', label: 'large egg yolk', detail: undefined })
  assert.deepEqual(show('egg-yolk', 4, 'whole'), { amount: '4', label: 'large egg yolks', detail: undefined })
  assert.equal(show('banana', 0.5, 'whole').label, 'medium banana')
  assert.deepEqual(show('banana', 1, 'whole', 1.5), { amount: '1 ½', label: 'medium bananas', detail: undefined })
  assert.equal(show('banana', 1, 'whole', 1, 'metric').detail, '120 g')
})

test('scoops pluralize and add grams in metric', () => {
  assert.deepEqual(show('whey', 1, 'scoop'), { amount: '1 scoop', label: 'whey protein powder', detail: undefined })
  assert.equal(show('whey', 1, 'scoop', 1.5).amount, '1 ½ scoops')
  assert.equal(show('whey', 1, 'scoop', 1, 'metric').detail, '32 g')
})

test('pinches stay whole counts', () => {
  assert.equal(show('salt', 1, 'pinch').amount, 'pinch')
  assert.equal(show('salt', 1, 'pinch', 0.5).amount, 'pinch')
  assert.equal(show('salt', 1, 'pinch', 2).amount, '2 pinches')
})

test('free-text lines with no catalog ingredient still format', () => {
  const free = (amount, unit, system = 'us') => formatLine({ name: 'oat milk', amount, unit }, null, 1, system)
  assert.deepEqual(free(1, 'cup', 'metric'), { amount: '235 ml', label: 'oat milk' })
  assert.equal(free(120, 'ml').amount, '½ cup')
  assert.equal(free(240, 'ml', 'metric').amount, '240 ml')
  assert.equal(free(50, 'g').amount, '50 g')
  assert.equal(free(1.5, 'oz').amount, '1 ½ oz')
  assert.equal(free(2, 'oz', 'metric').amount, '57 g')
  assert.equal(free(2, 'handful').amount, '2 handful')
  assert.equal(free(2, undefined).amount, '2')
  assert.deepEqual(formatLine({ name: 'eggs', amount: 2, unit: 'whole' }), { amount: '2', label: 'eggs', detail: undefined })
})

test('formatGrams rounds more coarsely as weights grow', () => {
  assert.equal(formatGrams(0.04), '0.1 g')
  assert.equal(formatGrams(5.44), '5.4 g')
  assert.equal(formatGrams(42.4), '42 g')
  assert.equal(formatGrams(123), '125 g')
})

test('gramsFor converts g, oz, and catalog units, and throws without a weight', () => {
  assert.equal(gramsFor({ amount: 50, unit: 'g' }, null), 50)
  assert.equal(gramsFor({ amount: 1, unit: 'oz' }, null, 2), 56.7)
  assert.equal(gramsFor(line('milk-2', 1, 'cup'), INGREDIENTS['milk-2']), 244)
  assert.equal(gramsFor(line('whey', 1, 'scoop'), INGREDIENTS.whey, 1.5), 48)
  assert.throws(() => gramsFor(line('mango', 1, 'tbsp'), INGREDIENTS.mango), /mango has no gram weight for "tbsp"/)
})

test('UNITS lists every unit the formatter handles', () => {
  assert.deepEqual([...UNITS].sort(), ['cup', 'g', 'ml', 'oz', 'pinch', 'scoop', 'tbsp', 'tsp', 'whole'])
})

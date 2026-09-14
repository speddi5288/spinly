import assert from 'node:assert/strict'
import test from 'node:test'
import { createPint, formatCountdown, freezeProgress, msUntilReady, pintStatus, sortPints } from './pints.js'

const HOUR = 60 * 60 * 1000
const MINUTE = 60 * 1000
const start = new Date('2026-09-13T12:00:00.000Z')
const at = (ms) => new Date(start.getTime() + ms)

function pint(id, frozenMs, { freezeHours = 24, spunAt = null } = {}) {
  return { ...createPint({ id, recipeId: 'r', recipeTitle: 'R', freezeHours, now: at(frozenMs) }), spunAt }
}

test('createPint records the freeze window and blank log fields', () => {
  assert.deepEqual(createPint({ id: 'p1', recipeId: 'mango', recipeTitle: 'Mango', now: start }), {
    id: 'p1',
    recipeId: 'mango',
    recipeTitle: 'Mango',
    frozenAt: '2026-09-13T12:00:00.000Z',
    readyAt: '2026-09-14T12:00:00.000Z',
    spunAt: null,
    rating: null,
    notes: '',
  })
  assert.equal(createPint({ recipeId: 'x', recipeTitle: 'X', freezeHours: 12, now: start }).readyAt, '2026-09-14T00:00:00.000Z')
  assert.equal(typeof createPint({ recipeId: 'x', recipeTitle: 'X' }).id, 'string')
})

test('status flips from freezing to ready at exactly the ready time', () => {
  const p = pint('p', 0)
  assert.equal(pintStatus(p, at(24 * HOUR - 1)), 'freezing')
  assert.equal(pintStatus(p, at(24 * HOUR)), 'ready')
  assert.equal(pintStatus(p, at(48 * HOUR)), 'ready')
  assert.equal(pintStatus({ ...p, spunAt: at(HOUR).toISOString() }, at(0)), 'spun')
})

test('msUntilReady counts down and stops at zero', () => {
  const p = pint('p', 0)
  assert.equal(msUntilReady(p, at(0)), 24 * HOUR)
  assert.equal(msUntilReady(p, at(23 * HOUR)), HOUR)
  assert.equal(msUntilReady(p, at(25 * HOUR)), 0)
})

test('freezeProgress runs from 0 to 1 and clamps', () => {
  const p = pint('p', 0)
  assert.equal(freezeProgress(p, at(-HOUR)), 0)
  assert.equal(freezeProgress(p, at(0)), 0)
  assert.equal(freezeProgress(p, at(12 * HOUR)), 0.5)
  assert.equal(freezeProgress(p, at(30 * HOUR)), 1)
  assert.equal(freezeProgress(pint('instant', 0, { freezeHours: 0 }), at(0)), 1)
})

test('formatCountdown reads in hours and minutes, rounding minutes up', () => {
  assert.equal(formatCountdown(0), 'Ready')
  assert.equal(formatCountdown(-5), 'Ready')
  assert.equal(formatCountdown(30 * 1000), '1 min')
  assert.equal(formatCountdown(45 * MINUTE), '45 min')
  assert.equal(formatCountdown(HOUR), '1 h')
  assert.equal(formatCountdown(2 * HOUR + 30 * MINUTE), '2 h 30 min')
  assert.equal(formatCountdown(59 * MINUTE + 30 * 1000), '1 h')
  assert.equal(formatCountdown(2 * HOUR + 59 * MINUTE + 1000), '3 h')
  assert.equal(formatCountdown(24 * HOUR), '24 h')
})

test('sortPints puts ready first, then freezing, then spun, newest first within each', () => {
  const now = at(30 * HOUR)
  const pints = [
    pint('spun-old', 0, { spunAt: at(25 * HOUR).toISOString() }),
    pint('freezing-old', 10 * HOUR),
    pint('ready-old', 0),
    pint('spun-new', 2 * HOUR, { spunAt: at(27 * HOUR).toISOString() }),
    pint('freezing-new', 20 * HOUR),
    pint('ready-new', 6 * HOUR),
  ]
  const before = pints.map((p) => p.id)
  assert.deepEqual(sortPints(pints, now).map((p) => p.id), ['ready-new', 'ready-old', 'freezing-new', 'freezing-old', 'spun-new', 'spun-old'])
  assert.deepEqual(pints.map((p) => p.id), before)
})

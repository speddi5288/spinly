import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_USER_DATA, diffUserData, isEmptyDiff, mergeUserData, sanitizeUserData, toggleInList } from './userDataModel.js'

function pint(id, changes = {}) {
  return { id, recipeId: 'mango-lime-sorbet', recipeTitle: 'Mango Lime Sorbet', frozenAt: '2026-09-13T12:00:00.000Z', readyAt: '2026-09-14T12:00:00.000Z', spunAt: null, rating: null, notes: '', ...changes }
}

const data = (changes = {}) => ({ ...DEFAULT_USER_DATA, ...changes })

// sanitizeUserData

test('sanitize returns defaults for non-objects', () => {
  for (const value of [null, undefined, 'x', 42]) assert.deepEqual(sanitizeUserData(value), DEFAULT_USER_DATA)
  assert.deepEqual(sanitizeUserData({}), DEFAULT_USER_DATA)
})

test('sanitize keeps valid values and dedupes lists', () => {
  const input = { favorites: ['a', 'b', 'a', 3, null], ratings: { a: 4 }, pantry: ['milk-2', 'milk-2', {}], machine: 'nc501', units: 'metric', notify: true, pints: [pint('p1')] }
  assert.deepEqual(sanitizeUserData(input), { favorites: ['a', 'b'], ratings: { a: 4 }, pantry: ['milk-2'], machine: 'nc501', units: 'metric', notify: true, pints: [pint('p1')] })
})

test('sanitize keeps only whole-star ratings from 1 to 5', () => {
  const ratings = { ok: 5, low: 1, zero: 0, six: 6, half: 3.5, text: '4', nothing: null }
  assert.deepEqual(sanitizeUserData({ ratings }).ratings, { ok: 5, low: 1 })
  assert.deepEqual(sanitizeUserData({ ratings: [4] }).ratings, {})
})

test('sanitize drops malformed pints and fills a missing recipeTitle', () => {
  const { recipeTitle: _omit, ...untitled } = pint('untitled')
  const pints = [
    pint('ok', { spunAt: '2026-09-14T13:00:00.000Z', rating: 4 }),
    untitled,
    pint('bad-rating', { rating: '5' }),
    pint('bad-spun', { spunAt: 123 }),
    { ...pint('no-notes'), notes: undefined },
    { id: 7 },
    null,
  ]
  const result = sanitizeUserData({ pints })
  assert.deepEqual(result.pints.map((p) => p.id), ['ok', 'untitled'])
  assert.equal(result.pints[1].recipeTitle, '')
})

test('sanitize rejects unknown machines, units, and non-true notify', () => {
  assert.deepEqual(sanitizeUserData({ machine: 'nc999', units: 'imperial', notify: 'yes', favorites: 'a' }), DEFAULT_USER_DATA)
})

// toggleInList

test('toggleInList adds and removes without mutating', () => {
  const list = Object.freeze(['a'])
  assert.deepEqual(toggleInList(list, 'b'), ['a', 'b'])
  assert.deepEqual(toggleInList(list, 'a'), [])
  assert.deepEqual(list, ['a'])
})

// mergeUserData

test('merge unions favorites and pints, and this device wins for the same pint', () => {
  const local = data({ favorites: ['a', 'b'], pints: [pint('shared', { notes: 'local' }), pint('local-only')] })
  const remote = data({ favorites: ['b', 'c'], pints: [pint('shared', { notes: 'remote' }), pint('remote-only')] })
  const merged = mergeUserData(local, remote)
  assert.deepEqual([...merged.favorites].sort(), ['a', 'b', 'c'])
  assert.equal(merged.favorites.length, 3)
  assert.deepEqual(merged.pints.map((p) => p.id).sort(), ['local-only', 'remote-only', 'shared'])
  assert.equal(merged.pints.find((p) => p.id === 'shared').notes, 'local')
})

test('merge unions ratings and this device wins for the same recipe', () => {
  const merged = mergeUserData(data({ ratings: { shared: 5, mine: 2 } }), data({ ratings: { shared: 1, theirs: 4, junk: 9 } }))
  assert.deepEqual(merged.ratings, { shared: 5, mine: 2, theirs: 4 })
  assert.deepEqual(mergeUserData(data({ ratings: { a: 3 } }), { favorites: [], pints: [] }).ratings, { a: 3 })
})

test('merge prefers local machine and non-default units, otherwise the account', () => {
  assert.equal(mergeUserData(data({ machine: 'nc301' }), data({ machine: 'nc501' })).machine, 'nc301')
  assert.equal(mergeUserData(data(), data({ machine: 'nc501' })).machine, 'nc501')
  assert.equal(mergeUserData(data(), data()).machine, null)
  assert.equal(mergeUserData(data({ units: 'metric' }), data({ units: 'us' })).units, 'metric')
  assert.equal(mergeUserData(data(), data({ units: 'metric' })).units, 'metric')
  assert.equal(mergeUserData(data(), { favorites: [], pints: [], machine: null }).units, 'us')
})

test('merge keeps device-only pantry and notify', () => {
  const merged = mergeUserData(data({ pantry: ['milk-2'], notify: true }), { favorites: [], pints: [], machine: null, units: 'us' })
  assert.deepEqual(merged.pantry, ['milk-2'])
  assert.equal(merged.notify, true)
})

// diffUserData / isEmptyDiff

test('diff reports added and removed favorites and pints, and profile changes', () => {
  const before = data({ favorites: ['a', 'b'], pints: [pint('same'), pint('edited'), pint('gone')], machine: null })
  const after = data({ favorites: ['b', 'c'], pints: [pint('same'), pint('edited', { rating: 5 }), pint('new')], machine: 'nc501' })
  const diff = diffUserData(before, after)
  assert.deepEqual(diff.favoritesAdded, ['c'])
  assert.deepEqual(diff.favoritesRemoved, ['a'])
  assert.deepEqual(diff.pintsUpserted.map((p) => p.id), ['edited', 'new'])
  assert.deepEqual(diff.pintsRemoved, ['gone'])
  assert.equal(diff.profileChanged, true)
  assert.equal(isEmptyDiff(diff), false)
})

test('diff reports new, changed, and removed ratings', () => {
  const diff = diffUserData(data({ ratings: { same: 4, changed: 2, gone: 5 } }), data({ ratings: { same: 4, changed: 3, added: 1 } }))
  assert.deepEqual(diff.ratingsUpserted, [['changed', 3], ['added', 1]])
  assert.deepEqual(diff.ratingsRemoved, ['gone'])
  assert.equal(isEmptyDiff(diff), false)
})

test('unchanged synced data is an empty diff, even when device-only fields change', () => {
  const before = data({ favorites: ['a'], ratings: { a: 4 }, pints: [pint('p')] })
  const after = { ...before, ratings: { a: 4 }, pints: [pint('p')], pantry: ['milk-2'], notify: true }
  assert.equal(isEmptyDiff(diffUserData(before, after)), true)
})

test('a units change alone is a profile change', () => {
  const diff = diffUserData(data(), data({ units: 'metric' }))
  assert.equal(diff.profileChanged, true)
  assert.equal(isEmptyDiff(diff), false)
})

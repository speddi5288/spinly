import assert from 'node:assert/strict'
import test from 'node:test'
import { MACHINES, PROGRAM_NAMES, fillProgram, getMachine, isMachineId, isProgramId, pintScale, programIdFromName, resolveProgram } from './machines.js'
import { getStarterRecipe } from './recipes.js'

const froyo = getStarterRecipe('blueberry-greek-froyo')

test('every machine lists only valid program ids', () => {
  for (const machine of MACHINES) {
    assert.ok(isMachineId(machine.id))
    for (const program of machine.programs) assert.ok(isProgramId(program), `${machine.id}: ${program}`)
  }
})

test('getMachine finds by id and returns null otherwise', () => {
  assert.equal(getMachine('nc501').name, 'CREAMi Deluxe')
  assert.equal(getMachine('nc999'), null)
  assert.equal(isMachineId('nc999'), false)
})

test('resolveProgram with no machine uses the first choice', () => {
  assert.deepEqual(resolveProgram(froyo.programs, null), { program: 'frozen_yogurt', name: 'Frozen Yogurt', isFallback: false, available: true })
})

test('Blueberry Froyo falls back to Lite Ice Cream on the 7-in-1', () => {
  assert.deepEqual(froyo.programs, ['frozen_yogurt', 'lite_ice_cream'])
  assert.deepEqual(resolveProgram(froyo.programs, getMachine('nc301')), { program: 'lite_ice_cream', name: 'Lite Ice Cream', isFallback: true, available: true })
})

test('Blueberry Froyo uses Frozen Yogurt on the Deluxe', () => {
  assert.deepEqual(resolveProgram(froyo.programs, getMachine('nc501')), { program: 'frozen_yogurt', name: 'Frozen Yogurt', isFallback: false, available: true })
})

test('a program the machine lacks, with no fallback, is not available', () => {
  assert.deepEqual(resolveProgram(['smoothie_bowl'], getMachine('nc501')), { program: 'smoothie_bowl', name: 'Smoothie Bowl', isFallback: false, available: false })
  assert.equal(resolveProgram(['smoothie_bowl'], getMachine('nc301')).available, true)
})

test('pintScale fills the machine pint for the recipe tub', () => {
  assert.equal(pintScale(getMachine('nc501')), 1.5)
  assert.equal(pintScale(getMachine('nc501'), 24), 1)
  assert.equal(pintScale(getMachine('nc301')), 1)
  assert.equal(pintScale(getMachine('nc301'), 24), 16 / 24)
  assert.equal(pintScale(null, 24), 1)
})

test('programIdFromName accepts display names and ids', () => {
  assert.equal(programIdFromName('Lite Ice Cream'), 'lite_ice_cream')
  assert.equal(programIdFromName('  lite ice cream '), 'lite_ice_cream')
  assert.equal(programIdFromName('lite_ice_cream'), 'lite_ice_cream')
  for (const [id, name] of Object.entries(PROGRAM_NAMES)) assert.equal(programIdFromName(name), id)
  assert.equal(programIdFromName('Hot Fudge'), null)
  assert.equal(programIdFromName(null), null)
})

test('fillProgram replaces every {program} placeholder', () => {
  assert.equal(fillProgram('Run {program}, then {program} again.', 'Sorbet'), 'Run Sorbet, then Sorbet again.')
  assert.equal(fillProgram('Scoop and enjoy.', 'Sorbet'), 'Scoop and enjoy.')
  const spinStep = froyo.steps.find((step) => step.includes('{program}'))
  const filled = fillProgram(spinStep, resolveProgram(froyo.programs, getMachine('nc301')).name)
  assert.ok(filled.includes('Lite Ice Cream'))
  assert.ok(!filled.includes('{program}'))
})

export const PROGRAM_NAMES = {
  ice_cream: 'Ice Cream',
  lite_ice_cream: 'Lite Ice Cream',
  sorbet: 'Sorbet',
  gelato: 'Gelato',
  milkshake: 'Milkshake',
  smoothie_bowl: 'Smoothie Bowl',
  frozen_yogurt: 'Frozen Yogurt',
  italian_ice: 'Italian Ice',
  creamiccino: 'CREAMiccino',
  frozen_drink: 'Frozen Drink',
  slushi: 'Slushi',
  soft_serve: 'Soft Serve Ice Cream',
  soft_serve_lite: 'Soft Serve Lite Ice Cream',
  fruit_whip: 'Fruit Whip',
  frozen_custard: 'Frozen Custard',
  soft_frozen_yogurt: 'Soft Serve Frozen Yogurt',
  creamifit: 'CreamiFit',
  mix_in: 'Mix-In',
}

export const PROGRAM_IDS = Object.keys(PROGRAM_NAMES)

export const MACHINES = [
  { id: 'nc301', name: 'CREAMi 7-in-1', model: 'NC301', pintOz: 16, programs: ['ice_cream', 'lite_ice_cream', 'gelato', 'sorbet', 'milkshake', 'smoothie_bowl', 'mix_in'] },
  { id: 'nc501', name: 'CREAMi Deluxe', model: 'NC501', pintOz: 24, programs: ['ice_cream', 'lite_ice_cream', 'sorbet', 'gelato', 'frozen_yogurt', 'italian_ice', 'creamiccino', 'frozen_drink', 'slushi', 'milkshake', 'mix_in'] },
  { id: 'nc701', name: 'CREAMi Scoop & Swirl', model: 'NC701', pintOz: 16, programs: ['ice_cream', 'lite_ice_cream', 'sorbet', 'gelato', 'frozen_yogurt', 'milkshake', 'mix_in', 'soft_serve', 'soft_serve_lite', 'fruit_whip', 'frozen_custard', 'soft_frozen_yogurt', 'creamifit'] },
]

export function getMachine(id) {
  return MACHINES.find((machine) => machine.id === id) ?? null
}

export function isMachineId(value) {
  return MACHINES.some((machine) => machine.id === value)
}

export function isProgramId(value) {
  return Object.hasOwn(PROGRAM_NAMES, value)
}

/** Accepts a program id or display name ("Lite Ice Cream") and returns the id, or null. */
export function programIdFromName(value) {
  if (isProgramId(value)) return value
  const text = String(value ?? '').trim().toLowerCase()
  return PROGRAM_IDS.find((id) => PROGRAM_NAMES[id].toLowerCase() === text) ?? null
}

/**
 * Picks the first of a recipe's programs (in preference order) that the machine has.
 * Returns { program, name, isFallback, available }.
 */
export function resolveProgram(programs, machine) {
  const preferred = programs[0]
  const nameOf = (id) => PROGRAM_NAMES[id] ?? String(id)
  if (!machine) return { program: preferred, name: nameOf(preferred), isFallback: false, available: true }
  const match = programs.find((program) => machine.programs.includes(program))
  if (!match) return { program: preferred, name: nameOf(preferred), isFallback: false, available: false }
  return { program: match, name: nameOf(match), isFallback: match !== preferred, available: true }
}

/** How much to multiply a recipe written for `tubOz` to fill this machine's pint. */
export function pintScale(machine, tubOz = 16) {
  return machine ? machine.pintOz / tubOz : 1
}

export function fillProgram(step, programName) {
  return step.replaceAll('{program}', programName)
}

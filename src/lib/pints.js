const HOUR = 60 * 60 * 1000
const MINUTE = 60 * 1000

/*
 * A pint log entry:
 * { id, recipeId, recipeTitle, frozenAt, readyAt, spunAt, rating, notes }
 * Dates are ISO strings. recipeTitle is a snapshot so the log still reads well
 * if a community recipe is renamed or deleted.
 */

export function createPint({ recipeId, recipeTitle, freezeHours = 24, now = new Date(), id = crypto.randomUUID() }) {
  return {
    id,
    recipeId,
    recipeTitle,
    frozenAt: now.toISOString(),
    readyAt: new Date(now.getTime() + freezeHours * HOUR).toISOString(),
    spunAt: null,
    rating: null,
    notes: '',
  }
}

export function pintStatus(pint, now = new Date()) {
  if (pint.spunAt) return 'spun'
  return new Date(pint.readyAt).getTime() <= now.getTime() ? 'ready' : 'freezing'
}

export function msUntilReady(pint, now = new Date()) {
  return Math.max(0, new Date(pint.readyAt).getTime() - now.getTime())
}

/** Fraction of the freeze that has elapsed, from 0 to 1. */
export function freezeProgress(pint, now = new Date()) {
  const start = new Date(pint.frozenAt).getTime()
  const end = new Date(pint.readyAt).getTime()
  if (end <= start) return 1
  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)))
}

export function formatCountdown(ms) {
  if (ms <= 0) return 'Ready'
  const hours = Math.floor(ms / HOUR)
  const minutes = Math.ceil((ms - hours * HOUR) / MINUTE)
  if (minutes === 60) return `${hours + 1} h`
  if (hours === 0) return `${minutes} min`
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`
}

/** Ready pints first, then freezing, then spun; newest first within each. */
export function sortPints(pints, now = new Date()) {
  const rank = { ready: 0, freezing: 1, spun: 2 }
  return [...pints].sort((a, b) => (
    rank[pintStatus(a, now)] - rank[pintStatus(b, now)]
    || new Date(b.frozenAt).getTime() - new Date(a.frozenAt).getTime()
  ))
}

export function isRating(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5
}

/** Rows from the `recipe_rating_stats` function → { [recipeId]: { average, count } }. */
export function statsFromRows(rows) {
  const stats = {}
  for (const row of rows ?? []) {
    const average = Number(row.average)
    const count = Number(row.count)
    if (typeof row.recipe_id === 'string' && Number.isFinite(average) && count > 0) {
      stats[row.recipe_id] = { average, count }
    }
  }
  return stats
}

/** Your own ratings ({ [recipeId]: 1-5 }) in the same shape, for when community ratings aren't available. */
export function statsFromPersonal(ratings) {
  const stats = {}
  for (const [id, rating] of Object.entries(ratings ?? {})) {
    if (isRating(rating)) stats[id] = { average: rating, count: 1 }
  }
  return stats
}

/** "4.5" */
export function formatAverage(average) {
  return (Math.round(average * 10) / 10).toFixed(1)
}

/** Higher average first, then more ratings; unrated recipes go last. Returns 0 when tied. */
export function compareByRating(a, b, stats) {
  const ra = stats[a.id]
  const rb = stats[b.id]
  if (!ra && !rb) return 0
  if (!ra) return 1
  if (!rb) return -1
  return rb.average - ra.average || rb.count - ra.count
}

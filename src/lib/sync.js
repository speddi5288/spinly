import { isRating } from './ratings.js'
import { supabase } from './supabase.js'
import { refreshRatingStats } from './useRatings.js'
import { getUserData, subscribeUserData, userData } from './userData.js'
import { diffUserData, isEmptyDiff, mergeUserData } from './userDataModel.js'

/*
 * Keeps a signed-in person's favorites, ratings, pint log, and machine/units in Supabase.
 * Local storage stays the source the UI reads; this mirrors it both ways at sign-in
 * and pushes each change afterwards.
 */

const PINT_COLUMNS = 'id, recipe_id, recipe_title, frozen_at, ready_at, spun_at, rating, notes'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_ROWS = 1000

const toIso = (value) => (value ? new Date(value).toISOString() : null)
const isRecipeId = (id) => typeof id === 'string' && id.length > 0 && id.length <= 100

function check({ error }) {
  if (error) throw error
}

// Row mapping ----------------------------------------------------------------

export function pintToRow(pint, userId) {
  return {
    id: pint.id,
    user_id: userId,
    recipe_id: pint.recipeId,
    recipe_title: (pint.recipeTitle ?? '').slice(0, 200),
    frozen_at: pint.frozenAt,
    ready_at: pint.readyAt,
    spun_at: pint.spunAt ?? null,
    rating: Number.isInteger(pint.rating) && pint.rating >= 1 && pint.rating <= 5 ? pint.rating : null,
    notes: (pint.notes ?? '').slice(0, 2000),
  }
}

export function rowToPint(row) {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    recipeTitle: row.recipe_title ?? '',
    frozenAt: toIso(row.frozen_at),
    readyAt: toIso(row.ready_at),
    spunAt: toIso(row.spun_at),
    rating: row.rating ?? null,
    notes: row.notes ?? '',
  }
}

// Queries --------------------------------------------------------------------

/** The account's saved data, shaped for mergeUserData: { favorites, ratings, pints, machine, units }. */
export async function fetchRemoteUserData(userId) {
  const [favorites, ratings, pints, profile] = await Promise.all([
    supabase.from('favorites').select('recipe_id').eq('user_id', userId).order('created_at').range(0, MAX_ROWS - 1),
    supabase.from('recipe_ratings').select('recipe_id, rating').eq('user_id', userId).range(0, MAX_ROWS - 1),
    supabase.from('pint_log').select(PINT_COLUMNS).eq('user_id', userId).order('frozen_at', { ascending: false }).range(0, MAX_ROWS - 1),
    supabase.from('profiles').select('machine, units').eq('id', userId).maybeSingle(),
  ])
  check(favorites)
  check(ratings)
  check(pints)
  check(profile)
  return {
    favorites: favorites.data.map((row) => row.recipe_id),
    ratings: Object.fromEntries(ratings.data.map((row) => [row.recipe_id, row.rating])),
    pints: pints.data.map(rowToPint),
    machine: profile.data?.machine ?? null,
    units: profile.data?.units ?? null,
  }
}

async function upsertFavorites(userId, recipeIds) {
  const rows = recipeIds.filter(isRecipeId).map((recipeId) => ({ user_id: userId, recipe_id: recipeId }))
  if (!rows.length) return
  check(await supabase.from('favorites').upsert(rows, { onConflict: 'user_id,recipe_id', ignoreDuplicates: true }))
}

async function deleteFavorites(userId, recipeIds) {
  if (!recipeIds.length) return
  check(await supabase.from('favorites').delete().eq('user_id', userId).in('recipe_id', recipeIds))
}

async function upsertRatings(userId, entries) {
  const rows = entries
    .filter(([recipeId, rating]) => isRecipeId(recipeId) && isRating(rating))
    .map(([recipeId, rating]) => ({ user_id: userId, recipe_id: recipeId, rating }))
  if (!rows.length) return false
  check(await supabase.from('recipe_ratings').upsert(rows, { onConflict: 'user_id,recipe_id' }))
  return true
}

async function deleteRatings(userId, recipeIds) {
  if (!recipeIds.length) return false
  check(await supabase.from('recipe_ratings').delete().eq('user_id', userId).in('recipe_id', recipeIds))
  return true
}

async function upsertPints(userId, pints) {
  const rows = pints.filter((pint) => UUID.test(pint.id) && isRecipeId(pint.recipeId)).map((pint) => pintToRow(pint, userId))
  if (!rows.length) return
  check(await supabase.from('pint_log').upsert(rows, { onConflict: 'id' }))
}

async function deletePints(userId, pintIds) {
  const ids = pintIds.filter((id) => UUID.test(id))
  if (!ids.length) return
  check(await supabase.from('pint_log').delete().eq('user_id', userId).in('id', ids))
}

async function upsertProfile(userId, data) {
  check(await supabase.from('profiles').upsert({ id: userId, machine: data.machine, units: data.units }, { onConflict: 'id' }))
}

export async function pushAll(userId, data) {
  const [, ratingsChanged] = await Promise.all([
    upsertFavorites(userId, data.favorites),
    upsertRatings(userId, Object.entries(data.ratings ?? {})),
    upsertPints(userId, data.pints),
    upsertProfile(userId, data),
  ])
  if (ratingsChanged) refreshRatingStats()
}

export async function pushDiff(userId, diff, data) {
  const [, , ratingsUpserted, ratingsRemoved] = await Promise.all([
    upsertFavorites(userId, diff.favoritesAdded),
    deleteFavorites(userId, diff.favoritesRemoved),
    upsertRatings(userId, diff.ratingsUpserted),
    deleteRatings(userId, diff.ratingsRemoved),
    upsertPints(userId, diff.pintsUpserted),
    deletePints(userId, diff.pintsRemoved),
    diff.profileChanged ? upsertProfile(userId, data) : null,
  ])
  if (ratingsUpserted || ratingsRemoved) refreshRatingStats()
}

// Session --------------------------------------------------------------------

/** Starts syncing for a signed-in user. Returns a function that stops it. */
export function startAccountSync(userId) {
  if (!supabase || !userId) return () => {}

  let stopped = false
  let applying = false
  let snapshot = null // the store state already mirrored; null until the first pull is merged
  let queue = Promise.resolve()

  const enqueue = (task) => {
    queue = queue
      .then(() => (stopped ? undefined : task()))
      .catch((error) => console.error('Spinly sync failed:', error))
  }

  const onChange = () => {
    if (stopped || applying || !snapshot) return
    const before = snapshot
    const after = getUserData()
    snapshot = after
    const diff = diffUserData(before, after)
    if (!isEmptyDiff(diff)) enqueue(() => pushDiff(userId, diff, after))
  }

  const pull = async () => {
    const remote = await fetchRemoteUserData(userId)
    if (stopped) return
    applying = true
    try {
      userData.replace(mergeUserData(getUserData(), remote))
    } finally {
      applying = false
    }
    snapshot = getUserData()
    await pushAll(userId, snapshot)
  }

  const unsubscribe = subscribeUserData(onChange)
  // Auth changes arrive inside Supabase's onAuthStateChange; don't start requests from within it.
  const timer = setTimeout(() => enqueue(pull), 0)

  return () => {
    stopped = true
    clearTimeout(timer)
    unsubscribe()
  }
}

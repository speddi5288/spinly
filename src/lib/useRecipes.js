import { useEffect, useState, useSyncExternalStore } from 'react'
import { STARTER_RECIPES, fromRow, getStarterRecipe } from './recipes.js'
import { supabase } from './supabase.js'

const COLUMNS = 'id, user_id, created_at, title, description, image_url, tub_size_oz, program, freeze_time_hours, freeze_note, respin_note, calories, protein, carbs, fat, ingredients, steps'
const PAGE_SIZE = 200
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// One shared fetch for every component. Starters are always included, even while loading or after an error.
let started = false
let pending = null
let snapshot = { recipes: STARTER_RECIPES, loading: Boolean(supabase), error: null, reload: reloadRecipes }
const listeners = new Set()

function publish(changes) {
  snapshot = { ...snapshot, ...changes }
  for (const listener of listeners) listener()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => snapshot

/** Refetches community recipes. Resolves once the shared list has updated (never rejects). */
function reloadRecipes() {
  if (!supabase) return Promise.resolve()
  started = true
  const request = supabase
    .from('recipes')
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .range(0, PAGE_SIZE - 1)
    .then(({ data, error }) => {
      if (error) throw error
      return data.map(fromRow)
    })
    .then(
      (community) => {
        if (pending === request) publish({ recipes: [...community, ...STARTER_RECIPES], loading: false, error: null })
      },
      (error) => {
        if (pending === request) publish({ loading: false, error })
      },
    )
  pending = request
  publish({ loading: true, error: null })
  return request
}

/** All recipes (starters + community). { recipes, loading, error, reload } */
export function useRecipes() {
  const result = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  useEffect(() => {
    if (supabase && !started) reloadRecipes()
  }, [])
  return result
}

/** One recipe by id. { recipe (null if not found), loading, error } */
export function useRecipe(id) {
  const { recipes } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const listed = getStarterRecipe(id) ?? recipes.find((recipe) => recipe.id === id) ?? null
  const canFetch = Boolean(supabase) && !listed && typeof id === 'string' && UUID.test(id)
  const [fetched, setFetched] = useState(null)

  useEffect(() => {
    if (!canFetch) return undefined
    let active = true
    supabase
      .from('recipes')
      .select(COLUMNS)
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error
        return data ? fromRow(data) : null
      })
      .then(
        (recipe) => { if (active) setFetched({ id, recipe, error: null }) },
        (error) => { if (active) setFetched({ id, recipe: null, error }) },
      )
    return () => { active = false }
  }, [id, canFetch])

  if (listed) return { recipe: listed, loading: false, error: null }
  if (!canFetch) return { recipe: null, loading: false, error: null }
  if (fetched?.id === id) return { recipe: fetched.recipe, loading: false, error: fetched.error }
  return { recipe: null, loading: true, error: null }
}

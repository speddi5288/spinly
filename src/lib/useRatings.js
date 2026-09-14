import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { statsFromPersonal, statsFromRows } from './ratings.js'
import { supabase } from './supabase.js'
import { useUserData } from './userData.js'

// One shared copy of community averages for every component.
let community = {}
let started = false
let timer = null
const listeners = new Set()

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = () => community

async function fetchStats() {
  started = true
  try {
    const { data, error } = await supabase.rpc('recipe_rating_stats')
    if (error) throw error
    community = statsFromRows(data)
    for (const listener of listeners) listener()
  } catch (error) {
    console.error('Couldn’t load ratings:', error)
  }
}

/** Refetches community averages shortly, e.g. after a rating syncs. */
export function refreshRatingStats() {
  if (!supabase) return
  clearTimeout(timer)
  timer = setTimeout(fetchStats, 300)
}

/**
 * { [recipeId]: { average, count } }: community averages when Supabase is set up,
 * otherwise your own ratings.
 */
export function useRatingStats() {
  const { ratings } = useUserData()
  const shared = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const personal = useMemo(() => statsFromPersonal(ratings), [ratings])

  useEffect(() => {
    if (supabase && !started) fetchStats()
  }, [])

  return supabase ? shared : personal
}

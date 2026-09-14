import { useEffect, useState, useSyncExternalStore } from 'react'
import { DEFAULT_USER_DATA, sanitizeUserData, toggleInList } from './userDataModel.js'

const STORAGE_KEY = 'spinly:user-data:v1'

let state = DEFAULT_USER_DATA
let loaded = false
const listeners = new Set()

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeUserData(JSON.parse(raw)) : DEFAULT_USER_DATA
  } catch {
    return DEFAULT_USER_DATA
  }
}

function emit() {
  for (const listener of listeners) listener()
}

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  state = readStorage()
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    state = readStorage()
    emit()
  })
}

export function getUserData() {
  ensureLoaded()
  return state
}

export function subscribeUserData(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function update(change) {
  ensureLoaded()
  const next = change(state)
  if (next === state) return
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private browsing or full storage: keep working in memory.
  }
  emit()
}

/** Every change to saved data goes through these. */
export const userData = {
  toggleFavorite: (recipeId) => update((d) => ({ ...d, favorites: toggleInList(d.favorites, recipeId) })),
  setMachine: (machine) => update((d) => ({ ...d, machine })),
  setUnits: (units) => update((d) => ({ ...d, units })),
  setNotify: (notify) => update((d) => ({ ...d, notify })),
  togglePantry: (ingredientId) => update((d) => ({ ...d, pantry: toggleInList(d.pantry, ingredientId) })),
  clearPantry: () => update((d) => ({ ...d, pantry: [] })),
  logPint: (pint) => update((d) => ({ ...d, pints: [pint, ...d.pints] })),
  updatePint: (id, changes) => update((d) => ({ ...d, pints: d.pints.map((pint) => (pint.id === id ? { ...pint, ...changes } : pint)) })),
  removePint: (id) => update((d) => ({ ...d, pints: d.pints.filter((pint) => pint.id !== id) })),
  replace: (next) => update(() => next),
}

/** The saved data, re-rendering on every change. */
export function useUserData() {
  return useSyncExternalStore(subscribeUserData, getUserData, () => DEFAULT_USER_DATA)
}

/** The current time, refreshed on an interval so countdowns tick. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}

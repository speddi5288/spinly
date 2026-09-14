import { isMachineId } from './machines.js'

/*
 * Everything a person saves, stored in localStorage and optionally synced to Supabase:
 * { favorites: [recipeId], pints: [PintEntry], pantry: [ingredientId], machine, units, notify }
 * pantry and notify stay on the device.
 */
export const DEFAULT_USER_DATA = { favorites: [], pints: [], pantry: [], machine: null, units: 'us', notify: false }

const isString = (value) => typeof value === 'string'

function isPint(value) {
  return Boolean(value) && typeof value === 'object'
    && isString(value.id) && isString(value.recipeId) && isString(value.frozenAt) && isString(value.readyAt)
    && (value.spunAt === null || isString(value.spunAt))
    && (value.rating === null || typeof value.rating === 'number')
    && isString(value.notes)
}

export function sanitizeUserData(value) {
  if (!value || typeof value !== 'object') return DEFAULT_USER_DATA
  return {
    favorites: Array.isArray(value.favorites) ? [...new Set(value.favorites.filter(isString))] : [],
    pints: Array.isArray(value.pints) ? value.pints.filter(isPint).map((pint) => ({ recipeTitle: '', ...pint })) : [],
    pantry: Array.isArray(value.pantry) ? [...new Set(value.pantry.filter(isString))] : [],
    machine: isMachineId(value.machine) ? value.machine : null,
    units: value.units === 'metric' ? 'metric' : 'us',
    notify: value.notify === true,
  }
}

export function toggleInList(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

/**
 * Combines this device's data with an account's ({ favorites, pints, machine, units }) at sign-in.
 * Nothing is dropped. For the same pint, this device's copy wins.
 */
export function mergeUserData(local, remote) {
  const pints = new Map(remote.pints.map((pint) => [pint.id, pint]))
  for (const pint of local.pints) pints.set(pint.id, pint)
  return {
    ...local,
    favorites: [...new Set([...remote.favorites, ...local.favorites])],
    pints: [...pints.values()],
    machine: local.machine ?? remote.machine ?? null,
    units: local.units !== DEFAULT_USER_DATA.units ? local.units : (remote.units ?? local.units),
  }
}

/** What changed between two snapshots, for pushing to Supabase. */
export function diffUserData(before, after) {
  const beforePints = new Map(before.pints.map((pint) => [pint.id, pint]))
  const afterIds = new Set(after.pints.map((pint) => pint.id))
  return {
    favoritesAdded: after.favorites.filter((id) => !before.favorites.includes(id)),
    favoritesRemoved: before.favorites.filter((id) => !after.favorites.includes(id)),
    pintsUpserted: after.pints.filter((pint) => JSON.stringify(beforePints.get(pint.id)) !== JSON.stringify(pint)),
    pintsRemoved: before.pints.filter((pint) => !afterIds.has(pint.id)).map((pint) => pint.id),
    profileChanged: before.machine !== after.machine || before.units !== after.units,
  }
}

export function isEmptyDiff(diff) {
  return !diff.favoritesAdded.length && !diff.favoritesRemoved.length
    && !diff.pintsUpserted.length && !diff.pintsRemoved.length && !diff.profileChanged
}

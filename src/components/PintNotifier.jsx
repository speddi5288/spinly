import { useEffect } from 'react'
import { getUserData, useUserData } from '../lib/userData.js'

const NOTIFIED_KEY = 'spinly:notified'
const MAX_DELAY = 2 ** 31 - 1
const LATE_LIMIT = 10 * 60 * 1000
const KEEP = 50

function readNotified() {
  try {
    const list = JSON.parse(window.localStorage.getItem(NOTIFIED_KEY) ?? '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function markNotified(id) {
  try {
    const list = [...readNotified().filter((item) => item !== id), id].slice(-KEEP)
    window.localStorage.setItem(NOTIFIED_KEY, JSON.stringify(list))
  } catch {
    // Storage unavailable: the notification tag still collapses duplicates.
  }
}

function canNotify() {
  return typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted'
}

async function showReady(pintId) {
  const { notify, pints } = getUserData()
  const pint = pints.find((item) => item.id === pintId)
  if (!notify || !pint || pint.spunAt || !canNotify() || readNotified().includes(pintId)) return
  markNotified(pintId)

  const title = `${pint.recipeTitle || 'Your pint'} is ready`
  const options = { body: 'Time to spin.', tag: `spinly-pint-${pintId}`, icon: '/favicon.svg', data: { url: '/fridge' } }
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration) {
      await registration.showNotification(title, options)
      return
    }
  } catch {
    // Fall back to a page notification.
  }
  try {
    const notification = new window.Notification(title, options)
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
}

/** Fires a system notification when each freezing pint is ready. Renders nothing. */
export default function PintNotifier() {
  const { notify, pints } = useUserData()

  useEffect(() => {
    if (!notify || !canNotify()) return
    const now = Date.now()
    const notified = readNotified()
    const timers = []
    for (const pint of pints) {
      if (pint.spunAt || notified.includes(pint.id)) continue
      const wait = new Date(pint.readyAt).getTime() - now
      if (Number.isNaN(wait) || wait > MAX_DELAY || wait < -LATE_LIMIT) continue
      timers.push(window.setTimeout(() => showReady(pint.id), Math.max(0, wait)))
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [notify, pints])

  return null
}

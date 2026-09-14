import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { startAccountSync } from '../lib/sync.js'

/** Mirrors saved recipes, the pint log, and settings to the signed-in account. Renders nothing. */
export default function AccountSync() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => (userId ? startAccountSync(userId) : undefined), [userId])

  return null
}

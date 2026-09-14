import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

// { configured, user, loading, signUp(email, password), signIn(email, password), signOut() }
// signUp/signIn resolve to { error } (error is null on success; signUp also returns { needsConfirmation }).
const notConfigured = async () => ({ error: new Error('Accounts are not set up.') })

const NOT_CONFIGURED = {
  configured: isSupabaseConfigured,
  user: null,
  loading: false,
  signUp: notConfigured,
  signIn: notConfigured,
  signOut: async () => ({ error: null }),
}

const AuthContext = createContext(NOT_CONFIGURED)

async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + '/account' },
    })
    return { error, needsConfirmation: !error && Boolean(data.user) && !data.session }
  } catch (error) {
    return { error, needsConfirmation: false }
  }
}

async function signIn(email, password) {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  } catch (error) {
    return { error }
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error }
  }
}

// Token refreshes hand back a new user object; keep the old one so consumers don't re-run.
function sameUser(a, b) {
  return a === b || (Boolean(a) && Boolean(b) && a.id === b.id && a.email === b.email && a.updated_at === b.updated_at)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    const apply = (session) => {
      if (!active) return
      const next = session?.user ?? null
      setUser((current) => (sameUser(current, next) ? current : next))
      setLoading(false)
    }
    supabase.auth.getSession()
      .then(({ data }) => apply(data.session))
      .catch(() => apply(null))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session))
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => (
    supabase ? { configured: true, user, loading, signUp, signIn, signOut } : NOT_CONFIGURED
  ), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}

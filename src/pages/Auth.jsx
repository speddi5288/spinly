import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useRecipes } from '../lib/useRecipes.js'
import '../styles/forms.css'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 6

function validate(email, password, creating) {
  const errors = {}
  if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email.'
  if (!password) errors.password = 'Enter a password.'
  else if (creating && password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`
  return errors
}

function authMessage(error, creating) {
  const message = error?.message ?? ''
  if (/invalid login credentials/i.test(message)) return 'Wrong email or password.'
  if (/email not confirmed/i.test(message)) return 'Confirm your email first.'
  if (/already (registered|exists)/i.test(message)) return 'That email already has an account.'
  if (/rate limit|too many/i.test(message)) return 'Too many tries. Wait a minute.'
  if (/fetch|network/i.test(message)) return 'Couldn’t connect. Try again.'
  return message || (creating ? 'Couldn’t create account.' : 'Couldn’t sign in.')
}

function SignInForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const busyRef = useRef(false)
  const creating = mode === 'signup'
  const errors = submitted ? validate(email, password, creating) : {}

  function switchMode(next) {
    if (next === mode) return
    setMode(next)
    setSubmitted(false)
    setFormError('')
    setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (busyRef.current) return
    setSubmitted(true)
    setFormError('')
    setNotice('')
    const found = validate(email, password, creating)
    if (found.email || found.password) {
      document.getElementById(found.email ? 'auth-email' : 'auth-password')?.focus()
      return
    }
    busyRef.current = true
    setBusy(true)
    const result = creating ? await signUp(email.trim(), password) : await signIn(email.trim(), password)
    busyRef.current = false
    setBusy(false)
    if (result.error) {
      setFormError(authMessage(result.error, creating))
    } else if (creating && result.needsConfirmation) {
      setMode('signin')
      setPassword('')
      setSubmitted(false)
      setNotice('Check your email to confirm.')
    }
  }

  const describe = (key) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `auth-${key}-error` : undefined,
  })

  return (
    <div className="panel auth-panel">
      <div className="auth-toggle" role="group" aria-label="Account">
        <button type="button" aria-pressed={!creating} onClick={() => switchMode('signin')}>Sign in</button>
        <button type="button" aria-pressed={creating} onClick={() => switchMode('signup')}>Create account</button>
      </div>

      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        {notice && <p className="form-status" role="status">{notice}</p>}
        <div className="form-field">
          <label htmlFor="auth-email">Email</label>
          <input
            className="form-input"
            id="auth-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            {...describe('email')}
          />
          {errors.email && <p className="field-error" id="auth-email-error">{errors.email}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="auth-password">Password</label>
          <input
            className="form-input"
            id="auth-password"
            type="password"
            autoComplete={creating ? 'new-password' : 'current-password'}
            minLength={creating ? MIN_PASSWORD : undefined}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            {...describe('password')}
          />
          {errors.password && <p className="field-error" id="auth-password-error">{errors.password}</p>}
        </div>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button type="submit" className="button button-primary" aria-disabled={busy || undefined}>
          {busy ? (creating ? 'Creating…' : 'Signing in…') : (creating ? 'Create account' : 'Sign in')}
        </button>
      </form>
    </div>
  )
}

function AccountView({ user }) {
  const { signOut } = useAuth()
  const { recipes, loading, error, reload } = useRecipes()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const mine = recipes.filter((recipe) => recipe.source === 'community' && recipe.user_id === user.id)

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    setSignOutError('')
    const result = await signOut()
    if (result?.error) {
      setSigningOut(false)
      setSignOutError('Couldn’t sign out. Try again.')
    }
  }

  let list
  if (mine.length) {
    list = (
      <ul className="account-recipes">
        {mine.map((recipe) => (
          <li key={recipe.id}>
            <Link className="account-recipe-title" to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
            <Link className="text-link" to={`/recipes/${recipe.id}/edit`} aria-label={`Edit ${recipe.title}`}>Edit</Link>
          </li>
        ))}
      </ul>
    )
  } else if (error) {
    list = <p className="form-note" role="alert">Couldn’t load recipes. <button type="button" className="browse-retry" onClick={reload}>Retry</button></p>
  } else if (loading) {
    list = <p className="form-note" role="status">Loading…</p>
  } else {
    list = <p className="form-note">None yet. <Link className="form-inline-link" to="/recipes/new">Add recipe</Link></p>
  }

  return (
    <div className="form-body">
      <div className="panel account-summary">
        <p className="account-email">{user.email}</p>
        <button type="button" className="form-quiet-button" onClick={handleSignOut} aria-disabled={signingOut || undefined}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
        {signOutError && <p className="form-error" role="alert">{signOutError}</p>}
      </div>

      <section className="account-recipes-section" aria-labelledby="your-recipes-title">
        <h2 className="form-section-title" id="your-recipes-title">Your recipes</h2>
        {list}
      </section>
    </div>
  )
}

export default function Auth() {
  const { configured, user, loading } = useAuth()

  let content = null
  if (!configured) content = <p className="form-note form-body">Accounts aren’t set up.</p>
  else if (loading) content = <p className="form-note form-body" role="status">Loading…</p>
  else if (user) content = <AccountView user={user} />
  else content = <div className="form-body"><SignInForm /></div>

  return (
    <section className="page container" aria-labelledby="account-title">
      <h1 className="page-title" id="account-title">Account</h1>
      {content}
    </section>
  )
}

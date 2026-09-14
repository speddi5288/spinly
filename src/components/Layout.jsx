import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { pintStatus } from '../lib/pints.js'
import { useNow, useUserData } from '../lib/userData.js'
import AppEffects from './AppEffects.jsx'
import ScoopMark from './ScoopMark.jsx'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function ReadyCount() {
  const { pints } = useUserData()
  const now = useNow(60000)
  const ready = pints.filter((pint) => pintStatus(pint, now) === 'ready').length
  if (!ready) return null
  return <span className="nav-badge">{ready}<span className="sr-only"> ready</span></span>
}

export default function Layout() {
  const { configured, user } = useAuth()

  return (
    <>
      <ScrollManager />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="header-inner container">
          <Link className="wordmark" to="/" aria-label="Spinly home">
            <ScoopMark /><span>spinly<span className="brand-dot">.</span></span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link to="/#recipes">Recipes</Link>
            <NavLink to="/pantry">Pantry</NavLink>
            <NavLink to="/pints">Pints <ReadyCount /></NavLink>
            <NavLink to="/saved">Saved</NavLink>
          </nav>
          {configured && (
            <div className="header-actions">
              {user && <Link className="button button-primary button-small" to="/recipes/new">Add recipe</Link>}
              <NavLink className="header-link" to="/account">{user ? 'Account' : 'Sign in'}</NavLink>
            </div>
          )}
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer container">
        <Link className="wordmark footer-wordmark" to="/" aria-label="Spinly home"><ScoopMark /><span>spinly.</span></Link>
        <p>Not affiliated with SharkNinja.</p>
        <a className="back-to-top" href="#main">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
      <AppEffects />
    </>
  )
}

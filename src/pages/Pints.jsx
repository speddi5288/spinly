import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ScoopMark from '../components/ScoopMark.jsx'
import AlertsToggle from '../components/pints/AlertsToggle.jsx'
import PintItem from '../components/pints/PintItem.jsx'
import PintLogForm from '../components/pints/PintLogForm.jsx'
import { pintStatus, sortPints } from '../lib/pints.js'
import { useRecipes } from '../lib/useRecipes.js'
import { useNow, useUserData } from '../lib/userData.js'
import '../styles/pints.css'

export default function Pints() {
  const { pints, notify } = useUserData()
  const { recipes, loading } = useRecipes()
  const now = useNow(30000)
  const [announcement, setAnnouncement] = useState('')
  const [focusId, setFocusId] = useState(null)
  const titleRef = useRef(null)

  const titles = new Map(recipes.map((recipe) => [recipe.id, recipe.title]))
  const sorted = sortPints(pints, now)
  const freezing = sorted.filter((pint) => pintStatus(pint, now) !== 'spun')
  const spun = sorted.filter((pint) => pintStatus(pint, now) === 'spun')
  const titleFor = (pint) => pint.recipeTitle || titles.get(pint.recipeId) || 'Pint'

  function renderList(list) {
    return (
      <ul className="pint-list">
        {list.map((pint) => (
          <PintItem
            key={pint.id}
            pint={pint}
            title={titleFor(pint)}
            now={now}
            focusRating={pint.id === focusId}
            onSpun={(id, title) => {
              setFocusId(id)
              setAnnouncement(`${title} marked spun`)
            }}
            onRemoved={(title) => {
              setAnnouncement(`${title} removed`)
              titleRef.current?.focus()
            }}
          />
        ))}
      </ul>
    )
  }

  return (
    <section className="page container pints-page" aria-labelledby="pints-title">
      <h1 id="pints-title" className="page-title" ref={titleRef} tabIndex={-1}>Your <em>pints.</em></h1>
      <p className="sr-only" role="status">{announcement}</p>

      <div className="panel pints-controls">
        <PintLogForm recipes={recipes} loading={loading} onLogged={(title) => setAnnouncement(`${title} added`)} />
        <AlertsToggle notify={notify} />
      </div>

      {pints.length === 0 && (
        <div className="empty-collection pints-empty">
          <div className="empty-icon"><ScoopMark /></div>
          <h3>No pints yet.</h3>
          <Link className="text-link" to="/#collections">Browse recipes</Link>
        </div>
      )}

      {freezing.length > 0 && (
        <section className="pints-section" aria-labelledby="pints-freezing-title">
          <h2 id="pints-freezing-title" className="eyebrow pints-heading">Freezing <span className="pints-count">{freezing.length}</span></h2>
          {renderList(freezing)}
        </section>
      )}

      {spun.length > 0 && (
        <section className="pints-section" aria-labelledby="pints-spun-title">
          <h2 id="pints-spun-title" className="eyebrow pints-heading">Spun <span className="pints-count">{spun.length}</span></h2>
          {renderList(spun)}
        </section>
      )}
    </section>
  )
}

import { Link } from 'react-router-dom'
import { pintReminderIcs } from '../../lib/ics.js'
import { formatCountdown, freezeProgress, msUntilReady, pintStatus } from '../../lib/pints.js'
import { userData } from '../../lib/userData.js'
import StarRating from './StarRating.jsx'

const STATUS_LABELS = { freezing: 'Freezing', ready: 'Ready', spun: 'Spun' }
const timeFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function formatTime(iso) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : timeFormat.format(date)
}

function downloadReminder(pint, title) {
  const readyAt = new Date(pint.readyAt)
  if (Number.isNaN(readyAt.getTime())) return
  const text = pintReminderIcs({
    uid: pint.id,
    title,
    readyAt,
    url: `${window.location.origin}/recipes/${encodeURIComponent(pint.recipeId)}`,
  })
  const href = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = href
  link.download = `spin-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pint'}.ics`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(href), 1000)
}

function Time({ label, iso }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd><time dateTime={iso}>{formatTime(iso)}</time></dd>
    </div>
  )
}

export default function PintItem({ pint, title, now, focusRating, onSpun, onRemoved }) {
  const status = pintStatus(pint, now)
  const titleId = `pint-${pint.id}-title`
  const percent = Math.round(freezeProgress(pint, now) * 100)

  function markSpun() {
    userData.updatePint(pint.id, { spunAt: new Date().toISOString() })
    onSpun(pint.id, title)
  }

  function remove() {
    if (!window.confirm(`Remove ${title}?`)) return
    userData.removePint(pint.id)
    onRemoved(title)
  }

  function saveNotes(event) {
    const notes = event.target.value
    if (notes !== pint.notes) userData.updatePint(pint.id, { notes })
  }

  return (
    <li>
      <article className="panel pint-item" aria-labelledby={titleId}>
        <div className="pint-head">
          <h3 id={titleId}><Link to={`/recipes/${encodeURIComponent(pint.recipeId)}`}>{title}</Link></h3>
          <span className={`pint-status pint-status-${status}`}>{STATUS_LABELS[status]}</span>
        </div>

        {status === 'freezing' && (
          <div>
            <div className="pint-bar" role="progressbar" aria-label="Freeze progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
              <span style={{ width: `${percent}%` }} />
            </div>
            <p className="pint-countdown">{formatCountdown(msUntilReady(pint, now))} left</p>
          </div>
        )}

        <dl className="pint-times">
          <Time label="Frozen" iso={pint.frozenAt} />
          <Time label="Ready" iso={pint.readyAt} />
          {pint.spunAt && <Time label="Spun" iso={pint.spunAt} />}
        </dl>

        {status === 'spun' && (
          <>
            <StarRating
              value={pint.rating}
              autoFocus={focusRating}
              onChange={(rating) => userData.updatePint(pint.id, { rating })}
            />
            <div className="pint-notes">
              <label htmlFor={`pint-${pint.id}-notes`}>Notes</label>
              <textarea
                id={`pint-${pint.id}-notes`}
                rows={2}
                maxLength={1000}
                defaultValue={pint.notes}
                onBlur={saveNotes}
              />
            </div>
          </>
        )}

        <div className="pint-actions">
          {status !== 'spun' && (
            <>
              <button type="button" className={`button ${status === 'ready' ? 'button-primary' : 'button-outline'}`} onClick={markSpun}>
                Mark spun
              </button>
              <button type="button" className="button button-outline" onClick={() => downloadReminder(pint, title)}>
                Add to calendar
              </button>
            </>
          )}
          <button type="button" className="clear-filters pint-remove" onClick={remove}>Remove</button>
        </div>
      </article>
    </li>
  )
}

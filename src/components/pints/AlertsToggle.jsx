import { useState } from 'react'
import { userData } from '../../lib/userData.js'

const UNAVAILABLE = 'Alerts aren’t available here. Use Add to calendar.'
const BLOCKED = 'Alerts are blocked. Use Add to calendar.'

function permissionState() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return window.Notification.permission
}

export default function AlertsToggle({ notify }) {
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const permission = permissionState()
  const on = notify && permission === 'granted'

  async function toggle() {
    if (on) {
      userData.setNotify(false)
      setMessage('')
      return
    }
    if (permission === 'unsupported') return setMessage(UNAVAILABLE)
    if (permission === 'denied') return setMessage(BLOCKED)
    setPending(true)
    try {
      const result = await window.Notification.requestPermission()
      if (result === 'granted') {
        userData.setNotify(true)
        setMessage('')
      } else {
        setMessage(BLOCKED)
      }
    } catch {
      setMessage(UNAVAILABLE)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="pint-alerts">
      <button type="button" className="filter-chip" aria-pressed={on} disabled={pending} onClick={toggle}>
        <span aria-hidden="true">{on ? '✓' : '+'}</span> Ready alerts
      </button>
      <p className="pint-alerts-note" role="status">{message}</p>
    </div>
  )
}

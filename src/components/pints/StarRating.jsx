import { useEffect, useRef } from 'react'

const STARS = [1, 2, 3, 4, 5]
const STEP = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }

function StarIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 1–5 stars. Choosing the current rating clears it. */
export default function StarRating({ value, onChange, autoFocus = false }) {
  const refs = useRef([])
  const focusable = value || 1

  useEffect(() => {
    if (autoFocus) refs.current[focusable - 1]?.focus()
    // Only on mount: moves focus here right after a pint is marked spun.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleKeyDown(event, star) {
    let next
    if (event.key in STEP) next = Math.min(5, Math.max(1, star + STEP[event.key]))
    else if (event.key === 'Home') next = 1
    else if (event.key === 'End') next = 5
    else return
    event.preventDefault()
    onChange(next)
    refs.current[next - 1]?.focus()
  }

  return (
    <div className="star-rating" role="radiogroup" aria-label="Rating">
      {STARS.map((star) => (
        <button
          key={star}
          ref={(element) => { refs.current[star - 1] = element }}
          type="button"
          role="radio"
          className="star"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          tabIndex={star === focusable ? 0 : -1}
          data-filled={value >= star}
          onClick={() => onChange(value === star ? null : star)}
          onKeyDown={(event) => handleKeyDown(event, star)}
        >
          <StarIcon filled={value >= star} />
        </button>
      ))}
    </div>
  )
}

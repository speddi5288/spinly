import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatAverage } from '../../lib/ratings.js'
import { useRatingStats } from '../../lib/useRatings.js'
import { userData, useUserData } from '../../lib/userData.js'
import StarIcon from '../StarIcon.jsx'

const VALUES = [1, 2, 3, 4, 5]

export default function RatingPanel({ recipe }) {
  const { ratings } = useUserData()
  const { configured, user } = useAuth()
  const stats = useRatingStats()[recipe.id]
  const [hover, setHover] = useState(0)
  const mine = ratings[recipe.id] ?? 0
  const shown = hover || mine

  function rate(value) {
    userData.setRating(recipe.id, mine === value ? null : value)
  }

  return (
    <div className="rating">
      <div className="rating-stars" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
        {VALUES.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mine === value}
            aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
            className={`rating-star${shown >= value ? ' is-on' : ''}`}
            onMouseEnter={() => setHover(value)}
            onFocus={() => setHover(0)}
            onClick={() => rate(value)}
          >
            <StarIcon filled={shown >= value} size={22} />
          </button>
        ))}
      </div>
      {configured && stats && (
        <p className="rating-summary">
          {formatAverage(stats.average)} <span>· {stats.count} {stats.count === 1 ? 'rating' : 'ratings'}</span>
        </p>
      )}
      {configured && !user && mine > 0 && <Link className="text-link rating-signin" to="/account">Sign in to share</Link>}
    </div>
  )
}

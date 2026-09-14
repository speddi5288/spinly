export default function StarIcon({ filled = true, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 3 2.8 5.9 6.2.8-4.5 4.3 1.1 6.3L12 17.3l-5.6 3 1.1-6.3L3 9.7l6.2-.8Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

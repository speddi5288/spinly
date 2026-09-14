import ScoopMark from './ScoopMark.jsx'

function BowlMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M9 11c1.5-2.5 4.5-2.5 6 0s4.5 2.5 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 15h24a12 12 0 0 1-24 0Z" fill="currentColor" />
      <path d="M11 29h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CupMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="m17 10 3-7h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 13h15l-1.6 13.2a2 2 0 0 1-2 1.8h-7.8a2 2 0 0 1-2-1.8L8.5 13Z" fill="currentColor" />
    </svg>
  )
}

/** The icon for a recipe category: a pint, a bowl, or a cup. */
export default function CategoryMark({ category }) {
  if (category === 'bowl') return <BowlMark />
  if (category === 'smoothie') return <CupMark />
  return <ScoopMark />
}

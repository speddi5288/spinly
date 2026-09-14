import { Link } from 'react-router-dom'
import CategoryMark from '../components/CategoryMark.jsx'
import { CATEGORIES } from '../lib/categories.js'
import { useRecipes } from '../lib/useRecipes.js'

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const gettingStarted = [
  { title: 'Pick a recipe.', description: 'Pint, bowl, or smoothie.' },
  { title: 'Prep it.', description: 'Blend, freeze, or layer.' },
  { title: 'Enjoy.', description: 'Spin, scoop, or sip.' },
]

export default function Home() {
  const { recipes } = useRecipes()
  const countFor = (id) => recipes.filter((recipe) => recipe.category === id).length

  return (
    <>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="short-line" /> FOR THE LOVE OF HOMEMADE</p>
          <h1 id="hero-title" className="hero-title-long">Good things come<br />by the pint, the bowl,<br />and <em>the glass.</em></h1>
          <p className="hero-description">CREAMi pints, yogurt bowls, and smoothies.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#collections">Explore recipes <Arrow /></a>
            <a className="text-link" href="#how-it-works">How it works</a>
          </div>
        </div>
        <div className="hero-art">
          <span className="art-note art-note-top">endless possibilities</span>
          <img className="pint-illustration" src="/pint.svg" alt="An illustrated mint-green Spinly pint topped with three scoops of ice cream and a spoon." width="480" height="470" />
          <div className="art-caption"><span className="status-dot" /> MADE AT HOME</div>
          <span className="art-note art-note-bottom">one happy pint.</span>
        </div>
      </section>

      <section className="collections-section container" id="collections" aria-labelledby="collections-title">
        <p className="eyebrow">THE COLLECTIONS</p>
        <h2 id="collections-title" className="sr-only">Collections</h2>
        <ul className="collections">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link className="collection-tile" to={category.path}>
                <span className="collection-mark"><CategoryMark category={category.id} /></span>
                <span className="collection-name">{category.label}</span>
                <span className="collection-count">{countFor(category.id)} recipes</span>
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="how-section container" id="how-it-works" aria-labelledby="how-title">
        <div className="how-intro"><p className="eyebrow">HOW IT WORKS</p><h2 id="how-title">From inspiration<br /> to the last spoonful.</h2></div>
        <ol className="how-steps">
          {gettingStarted.map((step, index) => (
            <li key={step.title}>
              <span className="step-number" aria-hidden="true">0{index + 1}</span>
              <h3>{step.title}</h3><p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

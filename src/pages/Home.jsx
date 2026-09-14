import Browse from './Browse.jsx'

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const gettingStarted = [
  { title: 'Find your flavor.', description: 'Pick a recipe.' },
  { title: 'Prep your pint.', description: 'Blend, then freeze 24 hours.' },
  { title: 'Spin. Scoop. Enjoy.', description: 'Run the program and dig in.' },
]

export default function Home() {
  return (
    <>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="short-line" /> FOR THE LOVE OF HOMEMADE</p>
          <h1 id="hero-title">Good things<br />come by <em>the pint.</em></h1>
          <p className="hero-description">Ninja CREAMi recipes, nutrition per tub.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#recipes">Explore recipes <Arrow /></a>
            <a className="text-link" href="#how-it-works">New to the spin?</a>
          </div>
        </div>
        <div className="hero-art">
          <span className="art-note art-note-top">endless possibilities</span>
          <img className="pint-illustration" src="/pint.svg" alt="An illustrated mint-green Spinly pint topped with three scoops of ice cream and a spoon." width="480" height="470" />
          <div className="art-caption"><span className="status-dot" /> MADE FOR YOUR CREAMi</div>
          <span className="art-note art-note-bottom">one happy pint.</span>
        </div>
      </section>

      <Browse />

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

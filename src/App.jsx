import ScoopMark from './components/ScoopMark.jsx'
import Browse from './pages/Browse.jsx'

function Arrow({ diagonal = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const gettingStarted = [
  { title: 'Find your flavor.', description: 'A classic you love or something a little unexpected. Start with a recipe that sounds like you.' },
  { title: 'Prep your pint.', description: 'Gather your ingredients, follow the recipe, and give your base the time it needs to freeze.' },
  { title: 'Spin. Scoop. Enjoy.', description: 'Let your CREAMi do its thing. Add your favorite mix-ins and make every spoonful your own.' },
]

function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="header-inner container">
          <a className="wordmark" href="#" aria-label="Spinly home">
            <ScoopMark /><span>spinly<span className="brand-dot">.</span></span>
          </a>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#recipes">Explore recipes</a>
            <a href="#how-it-works">How it works <Arrow diagonal /></a>
          </nav>
          <span className="header-note"><span className="status-dot" /> A little scoop of inspiration</span>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="short-line" /> FOR THE LOVE OF HOMEMADE</p>
            <h1 id="hero-title">Good things<br />come by <em>the pint.</em></h1>
            <p className="hero-description">Your next favorite Ninja CREAMi recipe starts here. A little inspiration for whatever you’re craving.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#recipes">Explore recipes <Arrow /></a>
              <a className="text-link" href="#how-it-works">New to the spin?</a>
            </div>
            <p className="hero-footnote"><span aria-hidden="true">✳</span> Your pint. Your ingredients. Your kind of good.</p>
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
          <div className="how-intro"><p className="eyebrow">A SIMPLE LITTLE RITUAL</p><h2 id="how-title">From inspiration<br /> to the last spoonful.</h2></div>
          <ol className="how-steps">
            {gettingStarted.map((step, index) => (
              <li key={step.title}>
                <span className="step-number" aria-hidden="true">0{index + 1}</span>
                <h3>{step.title}</h3><p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="site-footer container">
        <a className="wordmark footer-wordmark" href="#" aria-label="Spinly home"><ScoopMark /><span>spinly.</span></a>
        <p>A little inspiration. A better pint.</p>
        <a className="back-to-top" href="#">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  )
}

export default App

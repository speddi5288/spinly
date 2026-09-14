import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page container">
      <h1 className="page-title">Nothing here.</h1>
      <Link className="button button-primary page-action" to="/#recipes">Browse recipes</Link>
    </section>
  )
}

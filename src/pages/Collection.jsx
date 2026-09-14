import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getCategory } from '../lib/categories.js'
import { useRecipes } from '../lib/useRecipes.js'
import Browse from './Browse.jsx'

export default function Collection({ category }) {
  const meta = getCategory(category)
  const { recipes } = useRecipes()
  const { user } = useAuth()
  const count = recipes.filter((recipe) => recipe.category === category).length

  useEffect(() => {
    const previous = document.title
    document.title = `${meta.label} — Spinly`
    return () => { document.title = previous }
  }, [meta.label])

  return (
    <div className="page container collection">
      <header className="collection-header">
        <div>
          <p className="eyebrow"><span className="short-line" /> {count} RECIPES</p>
          <h1 className="page-title">{meta.lead}<em>{meta.accent}</em></h1>
        </div>
        {user && <Link className="text-link" to={`/recipes/new?category=${category}`}>+ Add</Link>}
      </header>
      <Browse key={category} category={category} />
    </div>
  )
}

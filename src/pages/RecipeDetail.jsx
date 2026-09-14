import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AmountControls from '../components/detail/AmountControls.jsx'
import IngredientList from '../components/detail/IngredientList.jsx'
import MachinePanel from '../components/detail/MachinePanel.jsx'
import NutritionPanel from '../components/detail/NutritionPanel.jsx'
import RatingPanel from '../components/detail/RatingPanel.jsx'
import RecipeActions from '../components/detail/RecipeActions.jsx'
import RecipeHeader from '../components/detail/RecipeHeader.jsx'
import StepsPanel from '../components/detail/StepsPanel.jsx'
import { getCategory, servingLabel } from '../lib/categories.js'
import { getMachine, pintScale, resolveProgram } from '../lib/machines.js'
import { useRecipe } from '../lib/useRecipes.js'
import { useUserData } from '../lib/userData.js'
import '../styles/detail.css'

function StatusPage({ children, role }) {
  return (
    <section className="page container detail-status">
      <p className="detail-status-text" role={role}>{children}</p>
      <Link className="text-link" to="/#collections"><span aria-hidden="true">←</span> Recipes</Link>
    </section>
  )
}

function RecipeView({ recipe }) {
  const { machine: machineId, units } = useUserData()
  const [count, setCount] = useState(1)
  const category = getCategory(recipe.category)
  const creami = recipe.category === 'creami'
  const machine = getMachine(machineId)
  const resolved = creami ? resolveProgram(recipe.programs, machine) : null
  const tubScale = creami ? pintScale(machine, recipe.tub_size_oz) : 1
  const tubOz = creami ? (machine ? machine.pintOz : recipe.tub_size_oz) : null

  useEffect(() => {
    const previous = document.title
    document.title = `${recipe.title} — Spinly`
    return () => { document.title = previous }
  }, [recipe.title])

  return (
    <article className="page container detail" aria-labelledby="detail-title">
      <Link className="text-link detail-back" to={category.path}><span aria-hidden="true">←</span> {category.label}</Link>
      <RecipeHeader recipe={recipe}>
        <RatingPanel recipe={recipe} />
        <RecipeActions recipe={recipe} />
      </RecipeHeader>

      <div className="detail-body">
        <div className="detail-side">
          <section className="panel detail-panel" aria-labelledby="ingredients-title">
            <h2 className="detail-heading" id="ingredients-title">Ingredients</h2>
            <AmountControls
              count={count}
              onCount={setCount}
              units={units}
              label={creami ? 'Pints' : 'Servings'}
              max={creami ? 4 : 6}
              size={creami ? `${count > 1 ? `${count} × ` : ''}${tubOz} oz` : null}
            />
            <IngredientList recipeId={recipe.id} ingredients={recipe.ingredients} scale={count * tubScale} units={units} />
          </section>
          <NutritionPanel recipe={recipe} scale={tubScale} label={servingLabel(recipe, tubOz)} />
        </div>

        <div className="detail-main">
          {creami && <MachinePanel recipe={recipe} machine={machine} resolved={resolved} />}
          <StepsPanel recipe={recipe} programName={resolved?.name ?? ''} />
        </div>
      </div>
    </article>
  )
}

export default function RecipeDetail() {
  const { id } = useParams()
  const { recipe, loading, error } = useRecipe(id)

  if (loading) return <StatusPage role="status">Loading…</StatusPage>
  if (error) return <StatusPage role="alert">Couldn’t load this recipe.</StatusPage>
  if (!recipe) return <StatusPage>Recipe not found.</StatusPage>
  return <RecipeView key={recipe.id} recipe={recipe} />
}

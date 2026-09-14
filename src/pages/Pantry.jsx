import IngredientPicker from '../components/pantry/IngredientPicker.jsx'
import PantryResults from '../components/pantry/PantryResults.jsx'
import { useRecipes } from '../lib/useRecipes.js'
import { useUserData } from '../lib/userData.js'
import '../styles/pantry.css'

export default function Pantry() {
  const { pantry } = useUserData()
  const { recipes, loading, error, reload } = useRecipes()

  return (
    <section className="page container pantry-page" aria-labelledby="pantry-title">
      <h1 id="pantry-title" className="page-title">Use what you <em>have.</em></h1>
      <div className="pantry-layout">
        <IngredientPicker pantry={pantry} />
        <div className="pantry-results">
          <PantryResults pantry={pantry} recipes={recipes} loading={loading} error={error} reload={reload} />
        </div>
      </div>
    </section>
  )
}

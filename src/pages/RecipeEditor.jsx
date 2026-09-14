import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import RecipeForm from '../components/RecipeForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getCategory, isCategoryId } from '../lib/categories.js'
import { toRow } from '../lib/recipes.js'
import { supabase } from '../lib/supabase.js'
import { useRecipe, useRecipes } from '../lib/useRecipes.js'
import '../styles/forms.css'

// No row came back (RLS filtered the update) or the policy rejected the write.
const PERMISSION_CODES = new Set(['PGRST116', '42501'])

export default function RecipeEditor() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const editing = id !== undefined
  const navigate = useNavigate()
  const { configured, user, loading: authLoading } = useAuth()
  const { recipe, loading, error } = useRecipe(editing ? id : undefined)
  const { reload } = useRecipes()
  const defaultCategory = isCategoryId(params.get('category')) ? params.get('category') : 'creami'

  async function save(values) {
    const row = toRow(values)
    const { data, error: saveError } = editing
      ? await supabase.from('recipes').update(row).eq('id', id).select('id').single()
      : await supabase.from('recipes').insert(row).select('id').single()
    if (saveError || !data) {
      console.error('Recipe save failed:', saveError)
      if (PERMISSION_CODES.has(saveError?.code)) return { error: editing ? 'You can’t edit this recipe.' : 'Sign in again to save.' }
      return { error: 'Couldn’t save. Try again.' }
    }
    await reload()
    navigate(`/recipes/${data.id}`)
    return { error: null }
  }

  let content
  if (!configured) {
    content = <p className="form-note">Accounts aren’t set up.</p>
  } else if (authLoading || (editing && loading)) {
    content = <p className="form-note" role="status">Loading…</p>
  } else if (!user) {
    content = <p className="form-note"><Link className="form-inline-link" to="/account">Sign in</Link> to {editing ? 'edit' : 'add'} recipes.</p>
  } else if (editing && error) {
    content = <p className="form-note" role="alert">Couldn’t load this recipe.</p>
  } else if (editing && !recipe) {
    content = <p className="form-note">Recipe not found.</p>
  } else if (editing && (recipe.source !== 'community' || recipe.user_id !== user.id)) {
    content = <p className="form-note">You can’t edit this recipe.</p>
  } else {
    content = (
      <RecipeForm
        key={editing ? recipe.id : `new-${defaultCategory}`}
        recipe={editing ? recipe : null}
        defaultCategory={defaultCategory}
        onSave={save}
        cancelTo={editing ? `/recipes/${id}` : getCategory(defaultCategory).path}
      />
    )
  }

  return (
    <section className="page container" aria-labelledby="editor-title">
      <h1 className="page-title" id="editor-title">{editing ? 'Edit recipe' : 'Add recipe'}</h1>
      <div className="form-body">{content}</div>
    </section>
  )
}

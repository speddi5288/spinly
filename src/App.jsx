import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Auth from './pages/Auth.jsx'
import Collection from './pages/Collection.jsx'
import Fridge from './pages/Fridge.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import Pantry from './pages/Pantry.jsx'
import RecipeDetail from './pages/RecipeDetail.jsx'
import RecipeEditor from './pages/RecipeEditor.jsx'
import Saved from './pages/Saved.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="creami" element={<Collection category="creami" />} />
        <Route path="bowls" element={<Collection category="bowl" />} />
        <Route path="smoothies" element={<Collection category="smoothie" />} />
        <Route path="recipes/new" element={<RecipeEditor />} />
        <Route path="recipes/:id" element={<RecipeDetail />} />
        <Route path="recipes/:id/edit" element={<RecipeEditor />} />
        <Route path="pantry" element={<Pantry />} />
        <Route path="fridge" element={<Fridge />} />
        <Route path="pints" element={<Navigate to="/fridge" replace />} />
        <Route path="saved" element={<Saved />} />
        <Route path="account" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

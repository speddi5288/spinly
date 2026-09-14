import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import Pantry from './pages/Pantry.jsx'
import Pints from './pages/Pints.jsx'
import RecipeDetail from './pages/RecipeDetail.jsx'
import RecipeEditor from './pages/RecipeEditor.jsx'
import Saved from './pages/Saved.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="recipes/new" element={<RecipeEditor />} />
        <Route path="recipes/:id" element={<RecipeDetail />} />
        <Route path="recipes/:id/edit" element={<RecipeEditor />} />
        <Route path="pantry" element={<Pantry />} />
        <Route path="pints" element={<Pints />} />
        <Route path="saved" element={<Saved />} />
        <Route path="account" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

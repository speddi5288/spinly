export function readNutritionLimit(value) {
  if (value === '' || value == null) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function selectRecipes(recipes, filters = {}, sort = 'newest') {
  const maxCalories = readNutritionLimit(filters.maxCalories)
  const minProtein = readNutritionLimit(filters.minProtein)
  const maxCarbs = readNutritionLimit(filters.maxCarbs)

  return recipes.filter((recipe) => (
    (!filters.under300 || recipe.calories < 300)
    && (maxCalories === null || recipe.calories <= maxCalories)
    && (minProtein === null || recipe.protein >= minProtein)
    && (maxCarbs === null || recipe.carbs <= maxCarbs)
  )).sort((a, b) => {
    const newestFirst = Date.parse(b.created_at) - Date.parse(a.created_at)
    if (sort === 'protein_desc') return b.protein - a.protein || newestFirst
    if (sort === 'calories_asc') return a.calories - b.calories || newestFirst
    return newestFirst
  })
}

import { INGREDIENTS } from './ingredients.js'

/** Catalog ingredient ids a recipe needs, ignoring optional lines and staples like salt and water. */
export function requiredIngredientIds(recipe) {
  return [...new Set(
    recipe.ingredients
      .filter((line) => !line.optional && line.ingredientId && !INGREDIENTS[line.ingredientId]?.staple)
      .map((line) => line.ingredientId),
  )]
}

/**
 * Ranks recipes by how few ingredients you'd still need.
 * Returns [{ recipe, have: [ids], missing: [ids], unknown: number }], best first.
 * `unknown` counts free-text lines on community recipes that don't match the catalog.
 */
export function matchPantry(recipes, pantryIds) {
  const owned = new Set(pantryIds)
  if (owned.size === 0) return []
  return recipes
    .map((recipe) => {
      const required = requiredIngredientIds(recipe)
      return {
        recipe,
        have: required.filter((id) => owned.has(id)),
        missing: required.filter((id) => !owned.has(id)),
        unknown: recipe.ingredients.filter((line) => !line.optional && !line.ingredientId).length,
      }
    })
    .filter((match) => match.have.length > 0)
    .sort((a, b) => (
      (a.missing.length + a.unknown) - (b.missing.length + b.unknown)
      || b.have.length - a.have.length
      || a.recipe.title.localeCompare(b.recipe.title)
    ))
}

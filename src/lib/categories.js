export const CATEGORIES = [
  { id: 'creami', label: 'Ninja CREAMi', lead: 'Ninja ', accent: 'CREAMi', short: 'CREAMi', path: '/creami', serving: 'tub' },
  { id: 'bowl', label: 'Yogurt bowls', lead: 'Yogurt ', accent: 'bowls', short: 'Yogurt bowl', path: '/bowls', serving: 'bowl' },
  { id: 'smoothie', label: 'Smoothies', lead: '', accent: 'Smoothies', short: 'Smoothie', path: '/smoothies', serving: 'smoothie' },
]

export const CATEGORY_IDS = CATEGORIES.map((category) => category.id)

export function isCategoryId(value) {
  return CATEGORY_IDS.includes(value)
}

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0]
}

/** "Per 16 oz tub", "Per bowl", or "Per smoothie". */
export function servingLabel(recipe, tubOz = recipe.tub_size_oz) {
  return recipe.category === 'creami' ? `Per ${tubOz} oz tub` : `Per ${getCategory(recipe.category).serving}`
}

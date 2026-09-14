export const UNITS = ['cup', 'tbsp', 'tsp', 'ml', 'g', 'oz', 'scoop', 'whole', 'pinch']

const TSP_PER = { cup: 48, tbsp: 3, tsp: 1 }
const ML_PER_TSP = 4.929
const GRAMS_PER_OZ = 28.35

const GLYPHS = { '0.125': '⅛', '0.25': '¼', '0.333': '⅓', '0.5': '½', '0.667': '⅔', '0.75': '¾' }
const CUP_FRACTIONS = [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4]
const TBSP_FRACTIONS = [1 / 2]
const TSP_FRACTIONS = [1 / 8, 1 / 4, 1 / 2, 3 / 4]
const HALVES = [1 / 2]

/** Rounds to the nearest allowed kitchen fraction. Returns [text, roundedValue]. */
export function roundToFraction(value, fractions) {
  let whole = Math.floor(value)
  const rest = value - whole
  let best = 0
  let bestDiff = rest
  for (const f of [...fractions, 1]) {
    const diff = Math.abs(rest - f)
    if (diff < bestDiff - 1e-9) {
      best = f
      bestDiff = diff
    }
  }
  if (best === 1) {
    whole += 1
    best = 0
  }
  if (whole === 0 && best === 0) {
    // Never round an ingredient away entirely.
    best = fractions.length ? fractions[0] : 0
    if (!best) whole = 1
  }
  const glyph = best ? GLYPHS[best.toFixed(3).replace(/0+$/, '')] ?? '' : ''
  return [[whole ? String(whole) : '', glyph].filter(Boolean).join(' '), whole + best]
}

export function formatAmount(value, fractions) {
  return roundToFraction(value, fractions)[0]
}

/** Grams for a line, using the catalog ingredient's weights. Throws when the unit has no weight. */
export function gramsFor(line, ingredient, scale = 1) {
  if (line.unit === 'g') return line.amount * scale
  if (line.unit === 'oz') return line.amount * GRAMS_PER_OZ * scale
  const perUnit = ingredient?.grams?.[line.unit]
  if (perUnit === undefined) throw new Error(`${ingredient?.id ?? line.name} has no gram weight for "${line.unit}"`)
  return line.amount * perUnit * scale
}

function formatVolumeUS(tsp) {
  if (tsp >= TSP_PER.cup / 4 - 1e-9) {
    const [text, rounded] = roundToFraction(tsp / TSP_PER.cup, CUP_FRACTIONS)
    return `${text} ${rounded > 1 ? 'cups' : 'cup'}`
  }
  if (tsp >= TSP_PER.tbsp - 1e-9) return `${formatAmount(tsp / TSP_PER.tbsp, TBSP_FRACTIONS)} tbsp`
  return `${formatAmount(tsp, TSP_FRACTIONS)} tsp`
}

function formatMl(ml) {
  const rounded = ml < 10 ? Math.round(ml * 2) / 2 : Math.round(ml / 5) * 5
  return `${rounded} ml`
}

export function formatGrams(grams) {
  if (grams < 10) return `${Math.max(0.1, Math.round(grams * 10) / 10)} g`
  if (grams < 100) return `${Math.round(grams)} g`
  return `${Math.round(grams / 5) * 5} g`
}

/**
 * Formats one ingredient line for display.
 * `line` is { name, amount, unit }. `ingredient` is the catalog entry or null for free-text lines.
 * Returns { amount: "¾ cup", label: "2% milk", detail?: "180 g" }.
 */
export function formatLine(line, ingredient = null, scale = 1, system = 'us') {
  const amount = line.amount * scale
  const label = ingredient?.name ?? line.name

  switch (line.unit) {
    case 'cup':
    case 'tbsp':
    case 'tsp': {
      const tsp = amount * TSP_PER[line.unit]
      if (system === 'us') return { amount: formatVolumeUS(tsp), label }
      if (ingredient && !ingredient.liquid && ingredient.grams[line.unit] !== undefined) {
        return { amount: formatGrams(gramsFor(line, ingredient, scale)), label }
      }
      return { amount: formatMl(tsp * ML_PER_TSP), label }
    }
    case 'ml':
      return { amount: system === 'us' ? formatVolumeUS(amount / ML_PER_TSP) : formatMl(amount), label }
    case 'g':
      return { amount: formatGrams(amount), label }
    case 'oz':
      return { amount: system === 'us' ? `${formatAmount(amount, [1 / 4, 1 / 2, 3 / 4])} oz` : formatGrams(amount * GRAMS_PER_OZ), label }
    case 'whole': {
      const [text, rounded] = roundToFraction(amount, HALVES)
      const noun = ingredient?.whole ?? { singular: line.name, plural: line.name }
      const detail = system === 'metric' && ingredient?.grams.whole ? formatGrams(gramsFor(line, ingredient, scale)) : undefined
      return { amount: text, label: rounded > 1 ? noun.plural : noun.singular, detail }
    }
    case 'scoop': {
      const [text, rounded] = roundToFraction(amount, HALVES)
      const detail = system === 'metric' && ingredient?.grams.scoop ? formatGrams(gramsFor(line, ingredient, scale)) : undefined
      return { amount: `${text} ${rounded > 1 ? 'scoops' : 'scoop'}`, label, detail }
    }
    case 'pinch': {
      const count = Math.max(1, Math.round(amount))
      return { amount: count === 1 ? 'pinch' : `${count} pinches`, label }
    }
    default:
      return { amount: `${Math.round(amount * 100) / 100} ${line.unit ?? ''}`.trim(), label }
  }
}

import { fillProgram } from '../../lib/machines.js'

function metaParts(recipe) {
  const parts = []
  if (recipe.prep_minutes) parts.push(`Prep ${recipe.prep_minutes} min`)
  if (recipe.freeze_time_hours) parts.push(`Freeze ${recipe.freeze_time_hours} h`)
  if (recipe.respins > 0) parts.push(`Re-spin ${recipe.respins}×`)
  if (recipe.mix_in) parts.push('Mix-in')
  return parts
}

export default function StepsPanel({ recipe, programName }) {
  const meta = metaParts(recipe)

  return (
    <section className="panel detail-panel" aria-labelledby="steps-title">
      <h2 className="detail-heading" id="steps-title">Steps</h2>
      {meta.length > 0 && <p className="detail-meta">{meta.join(' · ')}</p>}
      {recipe.freeze_note && <p className="detail-note"><strong>Freeze:</strong> {recipe.freeze_note}</p>}
      {recipe.respin_note && <p className="detail-note"><strong>Re-spin:</strong> {recipe.respin_note}</p>}
      <ol className="detail-steps">
        {recipe.steps.map((step, index) => (
          <li key={`${recipe.id}-step-${index}`}>
            <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <p>{fillProgram(step, programName)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

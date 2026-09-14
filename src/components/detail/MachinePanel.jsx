import { MACHINES, PROGRAM_NAMES, isMachineId } from '../../lib/machines.js'
import { userData } from '../../lib/userData.js'

const shortName = (machine) => machine.name.replace(/^CREAMi\s+/, '')

export default function MachinePanel({ recipe, machine, resolved }) {
  const preferred = PROGRAM_NAMES[recipe.programs[0]] ?? recipe.program

  function change(event) {
    const value = event.target.value
    userData.setMachine(isMachineId(value) ? value : null)
  }

  return (
    <section className="panel detail-panel detail-machine" aria-labelledby="machine-title">
      <h2 className="sr-only" id="machine-title">Machine</h2>
      <div className="detail-field">
        <label htmlFor="detail-machine">Machine</label>
        <select id="detail-machine" value={machine?.id ?? ''} onChange={change}>
          <option value="">Not set</option>
          {MACHINES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="detail-program">
        <p className="eyebrow">PROGRAM</p>
        <p className={`program-lit${resolved.available ? '' : ' is-off'}`}>
          <span className="program-lit-dot" aria-hidden="true" />
          {resolved.name}
        </p>
        {machine && resolved.isFallback && <p className="detail-note">No {preferred} on the {shortName(machine)}.</p>}
        {machine && !resolved.available && <p className="detail-note">Not available on the {shortName(machine)}.</p>}
      </div>
    </section>
  )
}

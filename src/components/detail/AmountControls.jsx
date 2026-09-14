import { userData } from '../../lib/userData.js'

const MIN = 1

/** Pint or serving count, plus the US / Metric toggle. `size` (e.g. "24 oz") is shown for CREAMi only. */
export default function AmountControls({ count, onCount, units, label, max, size }) {
  const noun = label.toLowerCase()
  return (
    <div className="detail-amounts">
      <div className="detail-stepper" role="group" aria-labelledby="amount-label">
        <span className="detail-control-label" id="amount-label">{label}</span>
        <div className="stepper">
          <button type="button" aria-label={`Fewer ${noun}`} disabled={count <= MIN} onClick={() => onCount(Math.max(MIN, count - 1))}>−</button>
          <output aria-live="polite">{count}</output>
          <button type="button" aria-label={`More ${noun}`} disabled={count >= max} onClick={() => onCount(Math.min(max, count + 1))}>+</button>
        </div>
        {size && <span className="detail-tub">{size}</span>}
      </div>

      <div className="segmented" role="group" aria-label="Units">
        <button type="button" aria-pressed={units === 'us'} onClick={() => userData.setUnits('us')}>US</button>
        <button type="button" aria-pressed={units === 'metric'} onClick={() => userData.setUnits('metric')}>Metric</button>
      </div>
    </div>
  )
}

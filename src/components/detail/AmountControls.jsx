import { userData } from '../../lib/userData.js'

const MIN = 1
const MAX = 4

export default function AmountControls({ count, onCount, units, tubOz }) {
  return (
    <div className="detail-amounts">
      <div className="detail-stepper" role="group" aria-labelledby="pints-label">
        <span className="detail-control-label" id="pints-label">Pints</span>
        <div className="stepper">
          <button type="button" aria-label="Fewer pints" disabled={count <= MIN} onClick={() => onCount(Math.max(MIN, count - 1))}>−</button>
          <output aria-live="polite">{count}</output>
          <button type="button" aria-label="More pints" disabled={count >= MAX} onClick={() => onCount(Math.min(MAX, count + 1))}>+</button>
        </div>
        <span className="detail-tub">{count > 1 ? `${count} × ` : ''}{tubOz} oz</span>
      </div>

      <div className="segmented" role="group" aria-label="Units">
        <button type="button" aria-pressed={units === 'us'} onClick={() => userData.setUnits('us')}>US</button>
        <button type="button" aria-pressed={units === 'metric'} onClick={() => userData.setUnits('metric')}>Metric</button>
      </div>
    </div>
  )
}

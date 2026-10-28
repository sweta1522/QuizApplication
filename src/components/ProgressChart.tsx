import { memo } from 'react'
import type { Attempt } from '../types/quiz'

const W = 600
const H = 220
const PAD = { l: 40, r: 16, t: 16, b: 28 }

/** Line chart of percentage over time. `attempts` must be oldest → newest. */
export const ProgressChart = memo(function ProgressChart({ attempts }: { attempts: Attempt[] }) {
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const x = (i: number) =>
    PAD.l + (attempts.length === 1 ? innerW / 2 : (i / (attempts.length - 1)) * innerW)
  const y = (pct: number) => PAD.t + innerH - (pct / 100) * innerH
  const points = attempts.map((a, i) => `${x(i)},${y(a.percentage)}`).join(' ')
  const label = `Line chart of your last ${attempts.length} scores, from ${attempts[0]?.percentage}% to ${attempts[attempts.length - 1]?.percentage}%. A table with the same data follows.`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="chart">
      {[0, 25, 50, 75, 100].map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="chart-grid" />
          <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" className="chart-text">
            {t}%
          </text>
        </g>
      ))}
      {attempts.length > 1 && <polyline points={points} className="chart-line" fill="none" />}
      {attempts.map((a, i) => (
        <circle key={a.id} cx={x(i)} cy={y(a.percentage)} r={4} className="chart-dot" />
      ))}
      <text x={PAD.l} y={H - 8} className="chart-text">
        Oldest
      </text>
      <text x={W - PAD.r} y={H - 8} textAnchor="end" className="chart-text">
        Latest
      </text>
    </svg>
  )
})

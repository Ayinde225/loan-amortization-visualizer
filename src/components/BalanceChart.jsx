import { useMemo } from 'react'
import { formatMoney } from '../lib/format.js'

/**
 * Hand-rolled SVG chart (no chart library) of the remaining balance over the
 * life of the loan, with a shaded area for the paid-down portion. Drawn in a
 * fixed 800x320 viewBox and scaled responsively by the container.
 */
export default function BalanceChart({ schedule }) {
  const W = 800
  const H = 320
  const pad = { top: 20, right: 20, bottom: 34, left: 64 }

  const geom = useMemo(() => {
    if (!schedule.length) return null

    const startBalance = schedule[0].balance + schedule[0].principal
    const maxBalance = startBalance
    const n = schedule.length

    const x = (i) => pad.left + (i / (n - 1 || 1)) * (W - pad.left - pad.right)
    const y = (bal) =>
      pad.top + (1 - bal / maxBalance) * (H - pad.top - pad.bottom)

    // Balance line starts at the opening balance (period 0), then each row.
    const points = [
      [x(0), y(startBalance)],
      ...schedule.map((row, i) => [x(i), y(row.balance)]),
    ]

    const line = points.map((p) => p.join(',')).join(' ')
    const area = `${pad.left},${y(0)} ${line} ${x(n - 1)},${y(0)}`

    // Year gridlines along the x-axis.
    const years = Math.ceil(n / 12)
    const step = years > 15 ? 5 : years > 6 ? 2 : 1
    const xTicks = []
    for (let yr = 0; yr <= years; yr += step) {
      const i = Math.min(yr * 12, n - 1)
      xTicks.push({ label: `${yr}y`, x: x(i) })
    }

    // Money gridlines along the y-axis.
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      label: formatMoney(maxBalance * f),
      y: y(maxBalance * f),
    }))

    return { line, area, xTicks, yTicks, baseY: y(0) }
  }, [schedule])

  if (!geom) {
    return <div className="chart-empty">Enter loan details to see the payoff curve.</div>
  }

  return (
    <svg
      className="balance-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Remaining loan balance over time"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {geom.yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            x2={W - pad.right}
            y1={t.y}
            y2={t.y}
            className="grid"
          />
          <text x={pad.left - 8} y={t.y + 4} className="axis-label" textAnchor="end">
            {t.label}
          </text>
        </g>
      ))}

      {geom.xTicks.map((t, i) => (
        <text key={i} x={t.x} y={H - 12} className="axis-label" textAnchor="middle">
          {t.label}
        </text>
      ))}

      <polygon points={geom.area} fill="url(#fill)" />
      <polyline points={geom.line} className="balance-line" fill="none" />
    </svg>
  )
}

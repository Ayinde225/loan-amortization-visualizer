import { useState } from 'react'
import { formatMoneyCents, formatMonthYear } from '../lib/format.js'

/**
 * The full period-by-period amortization table. Rows can run to 360+, so we
 * group by year with expandable sections and keep the DOM light by default.
 */
export default function ScheduleTable({ schedule }) {
  const [expanded, setExpanded] = useState(() => new Set([1]))

  if (!schedule.length) return null

  const byYear = groupByYear(schedule)

  const toggle = (year) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(year) ? next.delete(year) : next.add(year)
      return next
    })
  }

  return (
    <div className="schedule">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Payment</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {byYear.map(({ year, rows, totals }) => (
            <YearBlock
              key={year}
              year={year}
              rows={rows}
              totals={totals}
              open={expanded.has(year)}
              onToggle={() => toggle(year)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function YearBlock({ year, rows, totals, open, onToggle }) {
  return (
    <>
      <tr className="year-row" onClick={onToggle}>
        <td colSpan={2}>
          <span className={open ? 'caret open' : 'caret'}>▸</span> Year {year}
        </td>
        <td>{formatMoneyCents(totals.payment)}</td>
        <td>{formatMoneyCents(totals.principal)}</td>
        <td>{formatMoneyCents(totals.interest)}</td>
        <td>{formatMoneyCents(rows[rows.length - 1].balance)}</td>
      </tr>
      {open &&
        rows.map((row) => (
          <tr key={row.period} className="detail-row">
            <td>{row.period}</td>
            <td>{formatMonthYear(row.date)}</td>
            <td>{formatMoneyCents(row.payment)}</td>
            <td>{formatMoneyCents(row.principal)}</td>
            <td>{formatMoneyCents(row.interest)}</td>
            <td>{formatMoneyCents(row.balance)}</td>
          </tr>
        ))}
    </>
  )
}

function groupByYear(schedule) {
  const groups = new Map()
  for (const row of schedule) {
    const year = Math.ceil(row.period / 12)
    if (!groups.has(year)) {
      groups.set(year, { year, rows: [], totals: { payment: 0, principal: 0, interest: 0 } })
    }
    const g = groups.get(year)
    g.rows.push(row)
    g.totals.payment += row.payment
    g.totals.principal += row.principal
    g.totals.interest += row.interest
  }
  return [...groups.values()]
}

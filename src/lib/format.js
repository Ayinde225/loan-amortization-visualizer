/** Display formatting helpers. */

const currency0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currency2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const monthYear = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
})

/** e.g. $1,234 (no cents) — for big headline figures. */
export const formatMoney = (n) => currency0.format(n || 0)

/** e.g. $1,234.56 — for per-payment detail. */
export const formatMoneyCents = (n) => currency2.format(n || 0)

/** e.g. "Jul 2026" */
export const formatMonthYear = (date) => (date ? monthYear.format(date) : '—')

/** e.g. "30 yrs" / "27 yrs 4 mos" from a month count. */
export function formatDuration(months) {
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts = []
  if (y) parts.push(`${y} yr${y === 1 ? '' : 's'}`)
  if (m) parts.push(`${m} mo${m === 1 ? '' : 's'}`)
  return parts.join(' ') || '0 mos'
}

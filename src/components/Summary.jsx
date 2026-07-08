import {
  formatMoney,
  formatMoneyCents,
  formatMonthYear,
  formatDuration,
} from '../lib/format.js'

/**
 * Headline KPI cards + a principal-vs-interest breakdown bar, plus the
 * prepayment savings callout when extra payments are in play.
 */
export default function Summary({ summary, savings }) {
  const { monthlyPayment, totalInterest, totalPrincipal, totalPaid, months, payoffDate } = summary

  const interestShare = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0
  const principalShare = 100 - interestShare

  return (
    <section className="summary">
      <div className="cards">
        <Card label="Monthly payment" value={formatMoneyCents(monthlyPayment)} accent />
        <Card label="Total interest" value={formatMoney(totalInterest)} />
        <Card label="Total paid" value={formatMoney(totalPaid)} />
        <Card label="Payoff" value={formatMonthYear(payoffDate)} sub={formatDuration(months)} />
      </div>

      <div className="breakdown">
        <div className="breakdown-label">
          <span>
            <i className="dot dot-principal" /> Principal {formatMoney(totalPrincipal)}
          </span>
          <span>
            <i className="dot dot-interest" /> Interest {formatMoney(totalInterest)}
          </span>
        </div>
        <div className="breakdown-bar" role="img" aria-label="Principal versus interest split">
          <div className="seg seg-principal" style={{ width: `${principalShare}%` }} />
          <div className="seg seg-interest" style={{ width: `${interestShare}%` }} />
        </div>
        <small className="hint">
          {interestShare.toFixed(0)}% of everything you pay is interest.
        </small>
      </div>

      {savings && savings.monthsSaved > 0 && (
        <div className="savings">
          💡 Those extra payments save you <b>{formatMoney(savings.interestSaved)}</b> in interest
          and pay the loan off <b>{formatDuration(savings.monthsSaved)}</b> sooner.
        </div>
      )}
    </section>
  )
}

function Card({ label, value, sub, accent }) {
  return (
    <div className={accent ? 'card card-accent' : 'card'}>
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  )
}

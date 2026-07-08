/**
 * Loan amortization math.
 *
 * All functions here are pure (no UI, no side effects) so they can be unit
 * tested in isolation and reused anywhere. Money is handled as plain numbers
 * (dollars) and only rounded for display, not during the running calculation.
 */

/**
 * Standard fixed-rate monthly payment (the amortization formula):
 *
 *            P * r * (1 + r)^n
 *   M =  ---------------------------
 *              (1 + r)^n - 1
 *
 * where P = principal, r = monthly interest rate, n = number of payments.
 *
 * @param {number} principal      Loan amount in dollars.
 * @param {number} annualRatePct  Annual interest rate as a percent, e.g. 6.5.
 * @param {number} years          Term of the loan in years.
 * @returns {number} The fixed monthly payment.
 */
export function calculateMonthlyPayment(principal, annualRatePct, years) {
  const n = Math.round(years * 12)
  if (n <= 0 || principal <= 0) return 0

  const r = annualRatePct / 100 / 12

  // Zero-interest edge case: just split the principal evenly.
  if (r === 0) return principal / n

  const factor = Math.pow(1 + r, n)
  return (principal * r * factor) / (factor - 1)
}

/**
 * Build the full amortization schedule, one row per payment period.
 *
 * Supports an optional fixed extra monthly payment applied to principal, which
 * shortens the term and reduces total interest.
 *
 * @param {object} params
 * @param {number} params.principal      Loan amount in dollars.
 * @param {number} params.annualRatePct  Annual interest rate as a percent.
 * @param {number} params.years          Scheduled term in years.
 * @param {number} [params.extraMonthly] Extra principal paid each month.
 * @param {Date}   [params.startDate]    First payment date (defaults to today).
 * @returns {Array<object>} Schedule rows.
 */
export function generateSchedule({
  principal,
  annualRatePct,
  years,
  extraMonthly = 0,
  startDate = new Date(),
}) {
  const n = Math.round(years * 12)
  if (n <= 0 || principal <= 0) return []

  const r = annualRatePct / 100 / 12
  const basePayment = calculateMonthlyPayment(principal, annualRatePct, years)

  const schedule = []
  let balance = principal
  let cumulativeInterest = 0
  let cumulativePrincipal = 0
  let period = 0

  // Guard against pathological inputs that would never amortize (payment does
  // not cover interest). Cap the loop well beyond any realistic term.
  const maxPeriods = n + 1200

  while (balance > 0.005 && period < maxPeriods) {
    period += 1

    const interest = balance * r
    let principalPortion = basePayment - interest
    let extra = extraMonthly

    // Never pay more principal than what's left.
    if (principalPortion + extra >= balance) {
      principalPortion = Math.min(principalPortion, balance)
      extra = Math.max(0, balance - principalPortion)
    }

    const payment = interest + principalPortion + extra
    balance -= principalPortion + extra
    if (balance < 0) balance = 0

    cumulativeInterest += interest
    cumulativePrincipal += principalPortion + extra

    schedule.push({
      period,
      date: addMonths(startDate, period - 1),
      payment,
      interest,
      principal: principalPortion + extra,
      extra,
      balance,
      cumulativeInterest,
      cumulativePrincipal,
    })
  }

  return schedule
}

/**
 * Roll up a schedule into headline numbers.
 *
 * @param {Array<object>} schedule
 * @returns {{
 *   monthlyPayment: number,
 *   totalInterest: number,
 *   totalPaid: number,
 *   totalPrincipal: number,
 *   months: number,
 *   payoffDate: Date | null,
 * }}
 */
export function summarize(schedule) {
  if (!schedule.length) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalPaid: 0,
      totalPrincipal: 0,
      months: 0,
      payoffDate: null,
    }
  }

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0)
  const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0)

  // The scheduled monthly payment is the recurring amount, taken from the first
  // period (the final period may be smaller as the loan is paid off).
  const first = schedule[0]

  return {
    monthlyPayment: first.payment,
    totalInterest,
    totalPaid: totalInterest + totalPrincipal,
    totalPrincipal,
    months: schedule.length,
    payoffDate: schedule[schedule.length - 1].date,
  }
}

/**
 * Compare a scenario with extra payments against the plain loan to quantify the
 * interest and time saved.
 */
export function comparePrepayment(baseParams) {
  const base = summarize(
    generateSchedule({ ...baseParams, extraMonthly: 0 }),
  )
  const withExtra = summarize(generateSchedule(baseParams))

  return {
    interestSaved: base.totalInterest - withExtra.totalInterest,
    monthsSaved: base.months - withExtra.months,
  }
}

/** Add whole months to a date without mutating the original. */
export function addMonths(date, months) {
  const d = new Date(date.getTime())
  d.setMonth(d.getMonth() + months)
  return d
}

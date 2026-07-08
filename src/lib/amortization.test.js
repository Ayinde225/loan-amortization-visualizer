import { describe, it, expect } from 'vitest'
import {
  calculateMonthlyPayment,
  generateSchedule,
  summarize,
  comparePrepayment,
} from './amortization.js'

describe('calculateMonthlyPayment', () => {
  it('matches the textbook amortization formula', () => {
    // $200,000 @ 6% for 30 years -> ~$1,199.10 / month.
    const payment = calculateMonthlyPayment(200000, 6, 30)
    expect(payment).toBeCloseTo(1199.1, 1)
  })

  it('splits principal evenly when the rate is 0%', () => {
    // $12,000 @ 0% for 1 year -> $1,000 / month.
    expect(calculateMonthlyPayment(12000, 0, 1)).toBeCloseTo(1000, 6)
  })

  it('returns 0 for invalid input', () => {
    expect(calculateMonthlyPayment(0, 5, 30)).toBe(0)
    expect(calculateMonthlyPayment(100000, 5, 0)).toBe(0)
  })
})

describe('generateSchedule', () => {
  it('produces one row per scheduled month and pays the loan to zero', () => {
    const schedule = generateSchedule({
      principal: 200000,
      annualRatePct: 6,
      years: 30,
    })
    expect(schedule).toHaveLength(360)
    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 2)
  })

  it('reduces the balance every period', () => {
    const schedule = generateSchedule({
      principal: 100000,
      annualRatePct: 5,
      years: 15,
    })
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance)
    }
  })

  it('shortens the term when extra payments are made', () => {
    const base = generateSchedule({ principal: 200000, annualRatePct: 6, years: 30 })
    const extra = generateSchedule({
      principal: 200000,
      annualRatePct: 6,
      years: 30,
      extraMonthly: 300,
    })
    expect(extra.length).toBeLessThan(base.length)
  })
})

describe('summarize', () => {
  it('totals interest + principal to equal total paid', () => {
    const schedule = generateSchedule({ principal: 200000, annualRatePct: 6, years: 30 })
    const s = summarize(schedule)
    expect(s.totalInterest + s.totalPrincipal).toBeCloseTo(s.totalPaid, 2)
    expect(s.totalPrincipal).toBeCloseTo(200000, 0)
  })
})

describe('comparePrepayment', () => {
  it('reports positive interest and time saved for extra payments', () => {
    const { interestSaved, monthsSaved } = comparePrepayment({
      principal: 200000,
      annualRatePct: 6,
      years: 30,
      extraMonthly: 300,
    })
    expect(interestSaved).toBeGreaterThan(0)
    expect(monthsSaved).toBeGreaterThan(0)
  })
})

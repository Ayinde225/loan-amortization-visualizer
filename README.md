# 💰 Loan Amortization & Mortgage Visualizer

🔗 **Live demo:** [https://ayinde225.github.io/loan-amortization-visualizer/](https://ayinde225.github.io/loan-amortization-visualizer/)

[![Deploy to GitHub Pages](https://github.com/Ayinde225/loan-amortization-visualizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ayinde225/loan-amortization-visualizer/actions/workflows/deploy.yml)

An interactive tool for understanding the **true cost of borrowing**. Enter a loan
amount, interest rate, and term, and instantly see your monthly payment, total
interest, payoff date, a balance-over-time chart, and a full period-by-period
amortization schedule — plus how **extra monthly payments** shorten the term and
save on interest.

Built with **React + Vite**. The amortization math is written from first
principles (no finance library) and is fully unit-tested.

## ✨ Features

- **Monthly payment** from the standard amortization formula
- **Total interest / total paid / payoff date** at a glance
- **Principal-vs-interest breakdown** bar
- **Balance-over-time chart** — hand-drawn SVG, no chart library
- **Full amortization schedule**, grouped by year and expandable
- **Prepayment analysis** — quantifies interest and time saved from extra payments
- Responsive layout, keyboard-accessible inputs

## 🧮 The math

The fixed monthly payment for a fully-amortizing loan:

```
        P · r · (1 + r)^n
M =  ───────────────────────
          (1 + r)^n − 1
```

where `P` = principal, `r` = monthly interest rate (annual ÷ 12), and
`n` = number of payments (years × 12). Each period, interest accrues on the
outstanding balance and the remainder of the payment reduces principal. See
[`src/lib/amortization.js`](src/lib/amortization.js).

## 🚀 Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm test         # run the unit tests
```

## 🗂️ Project structure

```
src/
  lib/
    amortization.js       # pure finance math (payment, schedule, savings)
    amortization.test.js  # unit tests (Vitest)
    format.js             # currency / date formatting helpers
  components/
    LoanForm.jsx          # controlled inputs
    Summary.jsx           # KPI cards + breakdown + savings callout
    BalanceChart.jsx      # custom SVG balance-over-time chart
    ScheduleTable.jsx     # expandable year-by-year schedule
  App.jsx                 # composition + single source of truth for state
```

## 🧪 Testing

Amortization logic is covered by unit tests — payment formula, schedule
termination, monotonically decreasing balance, principal/interest totals, and
prepayment savings:

```bash
npm test
```

---

*A finance-meets-code project — the domain I know, expressed in software.*

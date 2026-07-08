import { useMemo, useState } from 'react'
import LoanForm from './components/LoanForm.jsx'
import Summary from './components/Summary.jsx'
import BalanceChart from './components/BalanceChart.jsx'
import ScheduleTable from './components/ScheduleTable.jsx'
import { generateSchedule, summarize, comparePrepayment } from './lib/amortization.js'

const DEFAULTS = {
  principal: 300000,
  annualRatePct: 6.5,
  years: 30,
  extraMonthly: 0,
}

export default function App() {
  const [values, setValues] = useState(DEFAULTS)

  // Coerce the controlled string inputs into numbers once, in one place.
  const params = useMemo(
    () => ({
      principal: Number(values.principal) || 0,
      annualRatePct: Number(values.annualRatePct) || 0,
      years: Number(values.years) || 0,
      extraMonthly: Number(values.extraMonthly) || 0,
    }),
    [values],
  )

  const schedule = useMemo(() => generateSchedule(params), [params])
  const summary = useMemo(() => summarize(schedule), [schedule])
  const savings = useMemo(
    () => (params.extraMonthly > 0 ? comparePrepayment(params) : null),
    [params],
  )

  return (
    <div className="app">
      <header className="masthead">
        <h1>Loan Amortization Visualizer</h1>
        <p>
          See your true cost of borrowing — monthly payment, total interest, payoff date, and how
          extra payments change the math.
        </p>
      </header>

      <main className="layout">
        <aside className="panel controls">
          <h2>Loan details</h2>
          <LoanForm values={values} onChange={setValues} />
        </aside>

        <div className="results">
          <Summary summary={summary} savings={savings} />
          <div className="panel chart-panel">
            <h2>Balance over time</h2>
            <BalanceChart schedule={schedule} />
          </div>
          <div className="panel">
            <h2>Amortization schedule</h2>
            <ScheduleTable schedule={schedule} />
          </div>
        </div>
      </main>

      <footer className="footer">
        Built with React · amortization math from first principles ·{' '}
        <span>a finance-meets-code project</span>
      </footer>
    </div>
  )
}

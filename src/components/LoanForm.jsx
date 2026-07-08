import { formatMoney } from '../lib/format.js'

/**
 * Controlled inputs for the loan parameters. State lives in the parent (App)
 * so every other panel recomputes from a single source of truth.
 */
export default function LoanForm({ values, onChange }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value })

  return (
    <form className="loan-form" onSubmit={(e) => e.preventDefault()}>
      <Field
        label="Loan amount"
        prefix="$"
        type="number"
        min="0"
        step="1000"
        value={values.principal}
        onChange={set('principal')}
      />

      <Field
        label="Annual interest rate"
        suffix="%"
        type="number"
        min="0"
        step="0.1"
        value={values.annualRatePct}
        onChange={set('annualRatePct')}
      />

      <div className="field">
        <label>Loan term</label>
        <div className="term-options">
          {[15, 20, 30].map((y) => (
            <button
              key={y}
              type="button"
              className={Number(values.years) === y ? 'term active' : 'term'}
              onClick={() => onChange({ ...values, years: y })}
            >
              {y} yr
            </button>
          ))}
          <input
            className="term-custom"
            type="number"
            min="1"
            max="40"
            value={values.years}
            onChange={set('years')}
            aria-label="Custom term in years"
          />
        </div>
      </div>

      <Field
        label="Extra monthly payment"
        prefix="$"
        type="number"
        min="0"
        step="50"
        value={values.extraMonthly}
        onChange={set('extraMonthly')}
        hint={
          Number(values.extraMonthly) > 0
            ? `Paying ${formatMoney(values.extraMonthly)} extra each month`
            : 'Add extra to see interest saved'
        }
      />
    </form>
  )
}

function Field({ label, prefix, suffix, hint, ...inputProps }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        {prefix && <span className="affix">{prefix}</span>}
        <input {...inputProps} />
        {suffix && <span className="affix suffix">{suffix}</span>}
      </div>
      {hint && <small className="hint">{hint}</small>}
    </div>
  )
}

import { useAppContext } from '../../context/AppContext'
import { useMetrics } from '../../hooks/useMetrics'
import { BudgetAllocation } from '../../types'

const LABELS: Record<keyof BudgetAllocation, string> = {
  fixedExpenses: 'Gastos fijos',
  variableExpenses: 'Gastos variables',
  savings: 'Ahorro / colchón',
  investment: 'Inversión',
  education: 'Formación / negocio',
}

const COLORS: Record<keyof BudgetAllocation, string> = {
  fixedExpenses: 'var(--color-expense)',
  variableExpenses: 'var(--color-liability)',
  savings: 'var(--color-neutral)',
  investment: 'var(--color-income)',
  education: 'var(--color-asset)',
}

function fmt(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR',
    maximumFractionDigits: 0 }).format(n)
}

export function BudgetMotor() {
  const { state, dispatch } = useAppContext()
  const m = useMetrics()
  const { budget } = state

  const totalSum = Math.round(
    Object.values(budget).reduce((a, b) => a + b, 0)
  )

  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-income)',
                       textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Distribución de Ingresos
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {fmt(m.totalIncome)}/mes
        </span>
      </div>

      {(Object.keys(budget) as Array<keyof BudgetAllocation>).map(key => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <label htmlFor={`budget-${key}`}
              style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {LABELS[key]}
            </label>
            <span style={{ fontSize: '0.78rem', color: COLORS[key], fontWeight: 600 }} className="number">
              {budget[key]}% · {fmt(m.budgetEuros[key])}
            </span>
          </div>
          <div style={{ position: 'relative', height: 6, background: 'var(--color-surface-2)',
                        borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%',
                          width: `${budget[key]}%`, background: COLORS[key],
                          borderRadius: 3, transition: 'width 0.2s' }} />
          </div>
          <input id={`budget-${key}`} type="range" min={0} max={100} step={1}
            value={budget[key]}
            onChange={e => dispatch({ type: 'SET_BUDGET', payload: { key, value: Number(e.target.value) } })}
            style={{ width: '100%', accentColor: COLORS[key], cursor: 'pointer' }} />
        </div>
      ))}

      <div style={{ textAlign: 'right', fontSize: '0.75rem',
                    color: totalSum === 100 ? 'var(--color-income)' : 'var(--color-expense)',
                    fontWeight: 700 }}>
        ∑ <span data-testid="budget-total">{totalSum}%</span>
        {totalSum === 100 ? ' ✓' : ' ⚠'}
      </div>
    </div>
  )
}

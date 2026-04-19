import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useMetrics } from '../../hooks/useMetrics'
import { useAppContext } from '../../context/AppContext'
import { RISK_PROFILE_RETURNS } from '../../types'
import { NumericInput } from '../shared/NumericInput'
import { HelpTip } from '../shared/HelpTip'

const HELP_APORTACION = `Cantidad que destinas a inversión cada mes.

Se pre-rellena automáticamente desde el % de Inversión de tu distribución de ingresos. Puedes editarlo manualmente; si lo haces, aparece el botón «↺ Sincronizar».

Ejemplo: si tienes 2.500 €/mes de ingresos y asignas un 20% a inversión → 500 €/mes.`

const HELP_HORIZONTE = `¿Cuántos años seguirás invirtiendo?

El interés compuesto necesita tiempo. Mínimo recomendado: 10–15 años.

Ejemplo: si tienes 35 años y quieres retirarte a los 55, pon 20.`

const HELP_OBJETIVO = `¿Cuánto quieres cobrar al mes cuando seas financieramente libre?

Por defecto usa tu ingreso activo actual. Ajústalo si tu objetivo de vida es diferente.

Ejemplo: si hoy ganas 3.000 €/mes pero con 2.000 €/mes vivirías bien, pon 2000.

Este valor determina el capital FIRE necesario: Objetivo × 12 ÷ tasa de retiro.`

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M €`
  if (n >= 1_000) return `${Math.round(n / 1000)}k €`
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR',
    maximumFractionDigits: 0 }).format(n)
}

function fmtFull(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR',
    maximumFractionDigits: 0 }).format(n)
}

function fmtMonth(n: number): string {
  return fmtFull(n) + '/mes'
}

interface KpiBoxProps { label: string; value: string; color: string }
function KpiBox({ label, value, color }: KpiBoxProps) {
  return (
    <div style={{ textAlign: 'center', padding: '6px 8px', background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius-sm)' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: 2,
                    textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color }} className="number">{value}</div>
    </div>
  )
}

export function Simulator() {
  const { state, dispatch } = useAppContext()
  const m = useMetrics()

  return (
    <div className="card">
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-asset)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
        Simulador — {(RISK_PROFILE_RETURNS[state.riskProfile] * 100).toFixed(0)}% anual
      </div>

      {/* Inputs row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Aportación mensual <HelpTip content={HELP_APORTACION} />
          </label>
          <NumericInput
            value={state.monthlyContribution}
            onChange={v => dispatch({ type: 'SET_MONTHLY_CONTRIBUTION', payload: { amount: v, manual: true } })}
          />
          {state.manualContributionOverride && (
            <button onClick={() => dispatch({ type: 'SET_MONTHLY_CONTRIBUTION',
              payload: { amount: m.budgetEuros.investment, manual: false } })}
              style={{ fontSize: '0.65rem', color: 'var(--color-asset)', background: 'none',
                       border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}>
              ↺ Sincronizar con valores de tabla
            </button>
          )}
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Horizonte (años) <HelpTip content={HELP_HORIZONTE} />
          </label>
          <NumericInput
            value={state.yearsHorizon}
            onChange={v => dispatch({ type: 'SET_YEARS_HORIZON', payload: Math.max(1, Math.round(v)) })}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Ingreso objetivo/mes <HelpTip content={HELP_OBJETIVO} />
          </label>
          <NumericInput
            value={state.desiredMonthlyIncome ?? m.totalIncomeActive}
            onChange={v => dispatch({ type: 'SET_DESIRED_INCOME', payload: v || null })}
          />
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)', marginTop: 2 }}>
            vacío = salario actual
          </div>
        </div>
      </div>

      {/* KPI boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
        <KpiBox label="Capital Futuro" value={fmt(m.futureValue)} color="var(--color-income)" />
        <KpiBox label="Ingreso Pasivo" value={fmtMonth(m.futurePassiveIncome)} color="var(--color-asset)" />
        <KpiBox label="Objetivo FIRE" value={fmtFull(m.fireTarget)} color="var(--color-neutral)" />
      </div>

      {/* Years to FIRE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                    padding: '6px 10px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Años para FIRE:</span>
        <span style={{ fontSize: '1.1rem', fontWeight: 700,
                       color: m.yearsToFire === null ? 'var(--color-income)' : 'var(--color-neutral)' }}
              className="number">
          {m.yearsToFire === null ? '¡Ya libre! 🎉' : `${m.yearsToFire} años`}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
          (regla {(state.withdrawalRate * 100).toFixed(0)}%)
        </span>
      </div>

      {/* Chart */}
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={m.yearlyProjection} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-asset)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-asset)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradContrib" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--color-text-dim)' }} />
            <YAxis hide />
            <Tooltip
              formatter={(value: number, name: string) => [fmt(value), name === 'value' ? 'Capital' : 'Aportado']}
              contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                              borderRadius: 6, fontSize: 11 }}
            />
            <ReferenceLine y={m.fireTarget} stroke="var(--color-neutral)" strokeDasharray="4 2"
              label={{ value: 'FIRE', fill: 'var(--color-neutral)', fontSize: 9 }} />
            <Area type="monotone" dataKey="contributions" stroke="var(--color-income)"
              strokeWidth={1} fill="url(#gradContrib)" />
            <Area type="monotone" dataKey="value" stroke="var(--color-asset)"
              strokeWidth={2} fill="url(#gradValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

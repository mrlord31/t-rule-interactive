import { useState, useRef } from 'react'
import { useMetrics } from '../../hooks/useMetrics'

function pct(n: number): string { return `${Math.round(n * 100)}%` }

const RED_TIPS: Record<string, string> = {
  housing: 'Reduce el coste de vivienda: renegocia la hipoteca, busca piso más económico o genera ingresos extras. Meta: ≤ 30% de tus ingresos.',
  debt: 'Usa el método avalancha: paga primero la deuda con mayor interés. Evita nueva deuda hasta bajar al ≤ 36% de tus ingresos.',
  savings: 'Automatiza una transferencia de ahorro el día de cobro antes de gastar. Revisa suscripciones y gastos variables. Meta: ≥ 20%.',
  coverage: 'Construye activos que generen ingresos pasivos: fondos indexados, ETFs o inmuebles de alquiler. Cada euro invertido te acerca a la cobertura total.',
  fire: 'Aumenta tus activos invertibles o tu aportación mensual. Reducir los gastos de vida también baja el objetivo FIRE.',
}

interface ChipProps {
  label: string
  value: string
  status: 'green' | 'yellow' | 'red'
  tipKey?: string
}

function Chip({ label, value, status, tipKey }: ChipProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null)
  const icon = status === 'green' ? '✓' : status === 'yellow' ? '~' : '⚠'
  const tip = status === 'red' && tipKey ? RED_TIPS[tipKey] : undefined

  function handleEnter() {
    if (!tip || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    setTipPos({ x: r.left, y: r.bottom + 6 })
  }

  return (
    <>
      <span
        ref={ref}
        className={`chip chip--${status}`}
        style={{ cursor: tip ? 'help' : 'default' }}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setTipPos(null)}
      >
        {icon} {label} {value}
      </span>
      {tipPos && tip && (
        <div style={{
          position: 'fixed',
          top: tipPos.y,
          left: tipPos.x,
          zIndex: 9999,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-red)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          width: 240,
          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          lineHeight: 1.55,
          pointerEvents: 'none',
        }}>
          💡 {tip}
        </div>
      )}
    </>
  )
}

export function Alerts() {
  const m = useMetrics()

  const coverageStatus: 'green' | 'yellow' | 'red' =
    m.passiveIncomeCoverage >= 1 ? 'green'
    : m.passiveIncomeCoverage >= 0.5 ? 'yellow'
    : 'red'

  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Alertas
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Chip label="Vivienda" value={pct(m.housingRatio)} status={m.alertHousing} tipKey="housing" />
        <Chip label="Deuda" value={pct(m.debtRatio)} status={m.alertDebt} tipKey="debt" />
        <Chip label="Ahorro" value={pct(m.savingsRatio)} status={m.alertSavings} tipKey="savings" />
        <Chip label="Pasivos cubren" value={pct(m.passiveIncomeCoverage)} status={coverageStatus} tipKey="coverage" />
        <Chip label="FIRE" value={pct(m.fireProgress)} status={m.fireStatus} tipKey="fire" />
      </div>
    </div>
  )
}

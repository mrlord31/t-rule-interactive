import { useMetrics } from '../../hooks/useMetrics'

const STATUS_COLORS = {
  green: 'var(--color-green)',
  yellow: 'var(--color-yellow)',
  red: 'var(--color-red)',
}

const STATUS_LABELS = {
  green: 'LIBRE — Ingresos pasivos cubren tus gastos',
  yellow: 'EN CAMINO — Sigue construyendo activos',
  red: 'INICIO — Enfócate en crear activos que generen ingresos',
}

function fmt(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR',
    maximumFractionDigits: 0 }).format(n)
}

export function Footer() {
  const m = useMetrics()
  const color = STATUS_COLORS[m.fireStatus]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                  padding: '8px 12px', borderTop: '1px solid var(--color-border)' }}>
      {/* FIRE semaphore */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: color,
                      boxShadow: `0 0 10px ${color}`, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>
            Semáforo Libertad Financiera ({(m.effectiveWithdrawalRate * 100).toFixed(0)}%)
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{STATUS_LABELS[m.fireStatus]}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            Progreso: {Math.round(m.fireProgress * 100)}% · Objetivo: {fmt(m.fireTarget)}
          </div>
        </div>
      </div>

      {/* Wealth number + coverage */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-neutral)' }}
               className="number">
            {m.wealthNumber.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Wealth Number</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)' }}>meses/año cubiertos</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Ingresos pasivos hoy cubren:
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700,
                        color: m.passiveIncomeCoverage >= 1 ? 'var(--color-green)'
                          : m.passiveIncomeCoverage >= 0.5 ? 'var(--color-yellow)'
                          : 'var(--color-red)' }}
               className="number">
            {Math.round(m.passiveIncomeCoverage * 100)}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>de tus gastos</div>
        </div>
      </div>
    </div>

    <div style={{ padding: '6px 12px', borderTop: '1px solid var(--color-border)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)' }}>
        T-Rule Interactive — calculadora de salud financiera y proyección FIRE orientada al mercado español (IRPF, IS, Patrimonio). Sin backend. Sin registro.
      </span>
      <span style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)' }}>·</span>
      <a href="https://github.com/mrlord31/t-rule-interactive#readme"
         target="_blank" rel="noopener noreferrer"
         style={{ fontSize: '0.6rem', color: 'var(--color-asset)', textDecoration: 'none' }}>
        Documentación técnica
      </a>
    </div>
  )
}

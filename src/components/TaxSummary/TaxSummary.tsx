import { useMetrics } from '../../hooks/useMetrics'
import { TaxSourceBreakdown } from '../../types'

function fmt(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR',
    maximumFractionDigits: 0 }).format(n)
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function categoryLabel(cat: TaxSourceBreakdown['category']): string {
  return cat === 'general' ? 'Base general' : cat === 'ahorro' ? 'Base ahorro'
    : cat === 'empresa' ? 'IS+Ahorro' : 'Patrimonio'
}

export function TaxSummary() {
  const m = useMetrics()
  const t = m.taxes

  if (t.grossMonthlyIncome === 0) return null

  const incomeSources = t.sourceBreakdown.filter(s => s.grossMonthly > 0)
  const hasPatrimonio = t.sourceBreakdown.some(s => s.category === 'patrimonio')

  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Estimación Fiscal
      </div>

      <div style={{ fontSize: '0.7rem', marginBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
                      gap: '2px 6px', color: 'var(--color-text-dim)', marginBottom: 4,
                      borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>
          <span>Fuente</span>
          <span>Tipo</span>
          <span style={{ textAlign: 'right' }}>Bruto</span>
          <span style={{ textAlign: 'right' }}>Impuesto</span>
          <span style={{ textAlign: 'right' }}>Neto</span>
        </div>
        {incomeSources.map((src, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
                                gap: '2px 6px', marginBottom: 2, alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-muted)', overflow: 'hidden',
                           textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {src.label}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)',
                           background: 'var(--color-surface-2)', borderRadius: 3, padding: '1px 4px' }}>
              {categoryLabel(src.category)}
            </span>
            <span style={{ textAlign: 'right', color: 'var(--color-income)' }} className="number">
              {fmt(src.grossMonthly)}
            </span>
            <span style={{ textAlign: 'right', color: 'var(--color-expense)' }} className="number">
              -{fmt(src.taxMonthly)}
            </span>
            <span style={{ textAlign: 'right', color: 'var(--color-neutral)' }} className="number">
              {fmt(src.netMonthly)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)',
                    borderTop: '1px solid var(--color-border)', paddingTop: 6, marginBottom: 6 }}>
        {t.irpfGeneral > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>IRPF base general</span>
            <span className="number">{fmt(t.irpfGeneral / 12)}/mes</span>
          </div>
        )}
        {(t.irpfAhorro > 0 || t.isEmpresa > 0) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>IRPF ahorro{t.isEmpresa > 0 ? ' + IS empresa' : ''}</span>
            <span className="number">{fmt((t.irpfAhorro + t.isEmpresa) / 12)}/mes</span>
          </div>
        )}
        {hasPatrimonio && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>Imp. Patrimonio</span>
            <span className="number">{fmt(t.impuestoPatrimonio / 12)}/mes</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)' }}>
          Total impuestos{' '}
          <strong style={{ color: 'var(--color-expense)' }}>{fmt(t.totalMonthlyTax)}/mes</strong>
          {' '}
          <span>({pct(t.effectiveTaxRate)} efectivo)</span>
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-neutral)' }} className="number">
          Neto {fmt(t.netMonthlyIncome)}/mes
        </div>
      </div>

      <div style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)',
                    marginTop: 6, fontStyle: 'italic' }}>
        ⚠ Estimación orientativa. Tipos varían por CCAA y situación personal.
      </div>
    </div>
  )
}

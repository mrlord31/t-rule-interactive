import { useMetrics } from '../../hooks/useMetrics'

function fmt(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR',
    maximumFractionDigits: 0 }).format(n)
}

interface KpiCardProps { label: string; value: string; color: string }

function KpiCard({ label, value, color }: KpiCardProps) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '8px 12px' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div className="kpi-value" style={{ color }}>{value}</div>
    </div>
  )
}

export function KpiStrip() {
  const m = useMetrics()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 8, padding: '8px 12px', background: 'var(--color-bg)' }}>
      <KpiCard label="Ingresos" value={fmt(m.totalIncome)} color="var(--color-income)" />
      <KpiCard label="Gastos" value={fmt(m.totalExpenses)} color="var(--color-expense)" />
      <KpiCard label="Flujo Libre" value={fmt(m.freeCashFlow)}
        color={m.freeCashFlow >= 0 ? 'var(--color-income)' : 'var(--color-expense)'} />
      <KpiCard label="Neto/mes" value={fmt(m.taxes.netMonthlyIncome)}
        color={m.taxes.netMonthlyIncome >= 0 ? 'var(--color-neutral)' : 'var(--color-expense)'} />
      <KpiCard label="Activos" value={fmt(m.totalAssets)} color="var(--color-asset)" />
      <KpiCard label="Pasivos" value={fmt(m.totalLiabilities)} color="var(--color-liability)" />
      <KpiCard label="Patrimonio" value={fmt(m.netWorth)}
        color={m.netWorth >= 0 ? 'var(--color-neutral)' : 'var(--color-expense)'} />
    </div>
  )
}

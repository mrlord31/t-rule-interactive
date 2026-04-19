import { useState } from 'react'
import { useMetrics } from '../../hooks/useMetrics'

function fmt(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR',
    maximumFractionDigits: 0 }).format(n)
}

function Box({ label, value, color, sub }: { label: string; value?: string; color: string; sub?: string }) {
  return (
    <div style={{
      border: `1px solid ${color}`,
      borderRadius: 4,
      padding: '5px 8px',
      background: 'var(--color-surface)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color }}>{label}</div>
      {value && <div style={{ fontSize: '0.8rem', fontWeight: 700, color, marginTop: 1 }}>{value}</div>}
      {sub && <div style={{ fontSize: '0.62rem', color: 'var(--color-text-dim)', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)', textTransform: 'uppercase',
                  letterSpacing: '0.06em', marginBottom: 3, marginTop: 8 }}>
      {children}
    </div>
  )
}

function ArrowDown({ label, color }: { label?: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', lineHeight: 1, margin: '3px 0', color }}>
      <div style={{ fontSize: '0.6rem' }}>{label}</div>
      <div style={{ fontSize: '0.85rem' }}>↓</div>
    </div>
  )
}

function Panel({
  title, color, incomeActive, incomePassive, expenses, assets, liabilities, showValues, isRich,
}: {
  title: string; color: string; showValues: boolean; isRich: boolean;
  incomeActive: number; incomePassive: number; expenses: number;
  assets: number; liabilities: number;
}) {
  const totalIncome = incomeActive + incomePassive

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 700, fontSize: '0.8rem', color, textAlign: 'center',
                    marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--color-border)' }}>
        {title}
      </div>

      <SectionLabel>Balance de ingresos</SectionLabel>

      <Box
        label="Ingresos"
        value={showValues ? fmt(totalIncome) : undefined}
        sub={showValues && incomePassive > 0 ? `activos ${fmt(incomeActive)} · pasivos ${fmt(incomePassive)}` : undefined}
        color="var(--color-income)"
      />

      <ArrowDown
        label={showValues ? fmt(expenses) : undefined}
        color="var(--color-expense)"
      />

      <Box
        label="Gastos"
        value={showValues ? fmt(expenses) : undefined}
        color="var(--color-expense)"
      />

      <SectionLabel>Hoja de Balance</SectionLabel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <Box
          label="Activos"
          value={showValues ? fmt(assets) : undefined}
          color="var(--color-asset)"
        />
        <Box
          label="Pasivos"
          value={showValues ? fmt(liabilities) : undefined}
          color="var(--color-liability)"
        />
      </div>

      <div style={{ marginTop: 8, fontSize: '0.65rem', lineHeight: 1.5,
                    color: 'var(--color-text-dim)', borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
        {isRich ? (
          <>
            <div style={{ color: 'var(--color-income)' }}>↑ Activos → Ingresos pasivos</div>
            <div style={{ color: 'var(--color-asset)' }}>↓ Ingresos → Activos (reinversión)</div>
          </>
        ) : (
          <>
            <div style={{ color: 'var(--color-text-dim)' }}>↓ Solo ingresos activos (trabajo)</div>
            <div style={{ color: 'var(--color-liability)' }}>↑ Pasivos drenan hacia Gastos</div>
          </>
        )}
      </div>
    </div>
  )
}

function categoryLabel(coverage: number): { label: string; color: string; desc: string } {
  if (coverage >= 1) return {
    label: '🟢 Libre financieramente',
    color: 'var(--color-green)',
    desc: 'Tus activos generan suficientes ingresos pasivos para cubrir todos tus gastos.',
  }
  if (coverage >= 0.5) return {
    label: '🟡 Clase Media en transición',
    color: 'var(--color-yellow)',
    desc: 'Tus ingresos pasivos cubren parte de tus gastos. Sigue construyendo activos.',
  }
  return {
    label: '🔴 Clase Trabajadora / Inicio',
    color: 'var(--color-red)',
    desc: 'Dependes casi por completo de tu tiempo. Objetivo: crear activos que generen ingresos pasivos.',
  }
}

export function FlowDiagram() {
  const [open, setOpen] = useState(false)
  const m = useMetrics()
  const cat = categoryLabel(m.passiveIncomeCoverage)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text-muted)',
          fontSize: '0.75rem',
          cursor: 'pointer',
          padding: '6px 12px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        💸 Ver flujo del dinero
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px 20px',
              maxWidth: 560,
              width: '95vw',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                Flujo del dinero
              </span>
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)',
                         cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>✕</button>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${cat.color}`, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: cat.color, marginBottom: 3 }}>
                {cat.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{cat.desc}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Ingresos pasivos cubren{' '}
                <strong style={{ color: cat.color }}>{Math.round(m.passiveIncomeCoverage * 100)}%</strong>
                {' '}de tus gastos.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Panel
                title="Clase Media"
                color="var(--color-text-muted)"
                showValues={false}
                isRich={false}
                incomeActive={0} incomePassive={0} expenses={0} assets={0} liabilities={0}
              />
              <div style={{ width: 1, background: 'var(--color-border)', flexShrink: 0 }} />
              <Panel
                title="Tu situación"
                color={cat.color}
                showValues={true}
                isRich={m.passiveIncomeCoverage >= 0.5}
                incomeActive={m.totalIncomeActive}
                incomePassive={m.totalIncomePassive}
                expenses={m.totalExpenses}
                assets={m.totalAssets}
                liabilities={m.totalLiabilities}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

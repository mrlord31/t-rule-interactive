import { useCallback } from 'react'
import { useAppContext } from '../../context/AppContext'
import { EntryType, LineItem } from '../../types'
import { NumericInput } from '../shared/NumericInput'
import { HelpTip } from '../shared/HelpTip'

interface Props {
  title: string
  color: string
  types: EntryType[]
  showLiquidToggle?: boolean
  showInvestableToggle?: boolean
  showIncomeTypeToggle?: boolean
  helpText?: string
}

function newItem(type: EntryType): LineItem {
  return { id: crypto.randomUUID(), type, label: '', amount: 0 }
}

function fmt(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR',
    maximumFractionDigits: 0 }).format(n)
}

type PassiveIncomeType = 'dividends' | 'rental' | 'company_dividends'
const INCOME_TYPE_CYCLE: PassiveIncomeType[] = ['dividends', 'rental', 'company_dividends']
const INCOME_TYPE_ICON: Record<PassiveIncomeType, string> = {
  dividends: '📈',
  rental: '🏠',
  company_dividends: '🏢',
}
const INCOME_TYPE_LABEL: Record<PassiveIncomeType, string> = {
  dividends: 'Dividendos/Fondos',
  rental: 'Alquiler',
  company_dividends: 'Empresa (IS+Dividendos)',
}

function nextIncomeType(current: PassiveIncomeType): PassiveIncomeType {
  const idx = INCOME_TYPE_CYCLE.indexOf(current)
  return INCOME_TYPE_CYCLE[(idx + 1) % INCOME_TYPE_CYCLE.length]
}

export function BlockTable({ title, color, types, showLiquidToggle, showInvestableToggle,
                             showIncomeTypeToggle, helpText }: Props) {
  const { state, dispatch } = useAppContext()
  const rows = state.items.filter(i => types.includes(i.type))
  const total = rows.reduce((s, r) => s + r.amount, 0)

  const primaryType = types[0]
  const trailingItem = newItem(primaryType)
  const allRows = [...rows, trailingItem]

  const handleChange = useCallback((item: LineItem, field: Partial<LineItem>) => {
    const updated = { ...item, ...field }
    dispatch({ type: 'SET_ITEM', payload: updated })
  }, [dispatch])

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id })
  }, [dispatch])

  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8, borderBottom: '1px solid var(--color-border)', paddingBottom: 6,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700,
                       fontSize: '0.8rem', color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
          {helpText && <HelpTip content={helpText} />}
        </span>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color }} className="number">
          {fmt(total)}
        </span>
      </div>

      {allRows.map((row, idx) => {
        const isTrailing = idx === allRows.length - 1
        const currentIncomeType = (row.incomeType as PassiveIncomeType | undefined) ?? 'dividends'

        return (
          <div key={row.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
            <input
              placeholder="nombre"
              value={row.label}
              onChange={e => handleChange(row, { label: e.target.value })}
              style={{
                flex: 1, minWidth: 0, background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)', padding: '4px 8px', fontSize: '0.8rem',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <NumericInput
                value={row.amount}
                onChange={v => handleChange(row, { amount: v })}
              />
            </div>

            {showIncomeTypeToggle && !isTrailing && row.type === 'incomePassive' && (
              <>
                <button
                  title={`Tipo fiscal: ${INCOME_TYPE_LABEL[currentIncomeType]} (clic para cambiar)`}
                  onClick={() => handleChange(row, { incomeType: nextIncomeType(currentIncomeType) })}
                  style={{
                    fontSize: '0.75rem', padding: '2px 5px', border: 'none',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
                  }}
                >
                  {INCOME_TYPE_ICON[currentIncomeType]}
                </button>
                {row.incomeType === 'rental' && (
                  <button
                    title="Alquiler residencial (reducción 50% IRPF)"
                    onClick={() => handleChange(row, { isResidentialRental: !row.isResidentialRental })}
                    style={{
                      fontSize: '0.6rem', padding: '2px 4px', border: 'none',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      background: row.isResidentialRental ? 'var(--color-income)' : 'var(--color-surface-2)',
                      color: row.isResidentialRental ? '#0f0f1a' : 'var(--color-text-muted)',
                    }}
                  >
                    {row.isResidentialRental ? 'R50' : 'NR'}
                  </button>
                )}
              </>
            )}

            {showInvestableToggle && !isTrailing && (
              <button
                title="Invertible"
                onClick={() => handleChange(row, { isInvestable: !row.isInvestable })}
                style={{
                  fontSize: '0.7rem', padding: '2px 6px', border: 'none',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: row.isInvestable ? 'var(--color-income)' : 'var(--color-surface-2)',
                  color: row.isInvestable ? '#0f0f1a' : 'var(--color-text-muted)',
                }}
              >
                ✦
              </button>
            )}
            {showLiquidToggle && !isTrailing && (
              <button
                title="Líquido/Ilíquido"
                onClick={() => handleChange(row, { isLiquid: !row.isLiquid })}
                style={{
                  fontSize: '0.65rem', padding: '2px 5px', border: 'none',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: row.isLiquid !== false ? 'var(--color-asset)' : 'var(--color-surface-2)',
                  color: row.isLiquid !== false ? '#0f0f1a' : 'var(--color-text-muted)',
                }}
              >
                {row.isLiquid !== false ? 'L' : 'I'}
              </button>
            )}
            {!isTrailing && (
              <button
                onClick={() => handleDelete(row.id)}
                style={{
                  fontSize: '0.7rem', background: 'none', border: 'none',
                  color: 'var(--color-text-dim)', cursor: 'pointer', padding: '2px 4px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

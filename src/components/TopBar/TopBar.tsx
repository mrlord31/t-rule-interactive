import { useAppContext } from '../../context/AppContext'
import { ThemeToggle } from '../shared/ThemeToggle'
import { State, WithdrawalRate } from '../../types'
import { PRESET_TRABAJADORA, PRESET_MEDIA, PRESET_RICA, PRESET_INVERSOR } from '../../data/presets'

const PRESETS = [
  { label: '👷 Trabajadora', preset: PRESET_TRABAJADORA, color: 'var(--color-text-muted)' },
  { label: '🏠 Clase Media',  preset: PRESET_MEDIA,       color: 'var(--color-income)'    },
  { label: '💼 Libre FIRE',   preset: PRESET_RICA,        color: 'var(--color-asset)'     },
  { label: '🏗️ Inversor',     preset: PRESET_INVERSOR,    color: 'var(--color-yellow)'    },
]

export function TopBar() {
  const { state, dispatch } = useAppContext()

  return (
    <header style={{
      padding: '8px 16px 6px',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-asset)' }}>
          💰 T-Rule Interactive
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Withdrawal rate toggle */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--color-surface-2)',
                        borderRadius: 'var(--radius-sm)', padding: 2 }}>
            {(['4%', '3%'] as const).map(label => {
              const rate: WithdrawalRate = label === '4%' ? 0.04 : 0.03
              const active = state.withdrawalRate === rate
              return (
                <button key={label} onClick={() => dispatch({ type: 'SET_WITHDRAWAL_RATE', payload: rate })}
                  style={{
                    padding: '3px 10px', border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    background: active ? 'var(--color-asset)' : 'transparent',
                    color: active ? '#0f0f1a' : 'var(--color-text-muted)',
                    transition: 'all 0.15s',
                  }}>
                  Regla {label}
                </button>
              )
            })}
          </div>

          {/* Risk profile */}
          <select
            value={state.riskProfile}
            onChange={e => dispatch({ type: 'SET_RISK_PROFILE', payload: e.target.value as State['riskProfile'] })}
            style={{
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--color-text)',
              padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            <option value="conservative">Conservador (4%)</option>
            <option value="balanced">Equilibrado (7%)</option>
            <option value="aggressive">Agresivo (10%)</option>
          </select>

          <ThemeToggle />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {PRESETS.map(({ label, preset, color }) => (
          <button
            key={label}
            onClick={() => dispatch({ type: 'LOAD_PRESET', payload: preset })}
            style={{
              fontSize: '0.65rem', padding: '3px 10px',
              background: 'var(--color-surface-2)',
              border: `1px solid ${color}`,
              borderRadius: 'var(--radius-sm)',
              color, cursor: 'pointer',
              fontWeight: 600,
              transition: 'opacity 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  )
}

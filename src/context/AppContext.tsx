import React, { createContext, useContext, useReducer, Dispatch } from 'react'
import { State, LineItem, DEFAULT_STATE, WithdrawalRate, BudgetAllocation } from '../types'
import { normalizeLinvest } from '../engine/calculations'

type Action =
  | { type: 'SET_ITEM'; payload: LineItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_RISK_PROFILE'; payload: State['riskProfile'] }
  | { type: 'SET_WITHDRAWAL_RATE'; payload: WithdrawalRate }
  | { type: 'SET_DESIRED_INCOME'; payload: number | null }
  | { type: 'SET_MONTHLY_CONTRIBUTION'; payload: { amount: number; manual: boolean } }
  | { type: 'SET_YEARS_HORIZON'; payload: number }
  | { type: 'SET_BUDGET'; payload: { key: keyof BudgetAllocation; value: number } }
  | { type: 'LOAD_PRESET'; payload: State }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEM': {
      const exists = state.items.find(i => i.id === action.payload.id)
      const items = exists
        ? state.items.map(i => i.id === action.payload.id ? action.payload : i)
        : [...state.items, action.payload]
      return { ...state, items }
    }
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    case 'SET_RISK_PROFILE':
      return { ...state, riskProfile: action.payload }
    case 'SET_WITHDRAWAL_RATE':
      return { ...state, withdrawalRate: action.payload }
    case 'SET_DESIRED_INCOME':
      return { ...state, desiredMonthlyIncome: action.payload }
    case 'SET_MONTHLY_CONTRIBUTION':
      return {
        ...state,
        monthlyContribution: action.payload.amount,
        manualContributionOverride: action.payload.manual,
      }
    case 'SET_YEARS_HORIZON':
      return { ...state, yearsHorizon: action.payload }
    case 'SET_BUDGET': {
      const budget = normalizeLinvest(state.budget, action.payload.key, action.payload.value)
      return { ...state, budget }
    }
    case 'LOAD_PRESET':
      return action.payload
    default:
      return state
  }
}

interface ContextValue {
  state: State
  dispatch: Dispatch<Action>
}

const AppContext = createContext<ContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext(): ContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}

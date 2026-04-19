import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import { calcMetrics } from '../engine/calculations'
import { CalculatedMetrics } from '../types'

export function useMetrics(): CalculatedMetrics {
  const { state } = useAppContext()
  return useMemo(() => calcMetrics(state), [state])
}

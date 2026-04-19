import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useEffect } from 'react'
import { AppProvider } from '../../context/AppContext'
import { Simulator } from './Simulator'
import { useAppContext } from '../../context/AppContext'

function Setup({ incomeActive }: { incomeActive: number }) {
  const { dispatch } = useAppContext()
  useEffect(() => {
    dispatch({ type: 'SET_ITEM', payload: { id: '1', type: 'incomeActive', label: 'S', amount: incomeActive } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Simulator />
}

function renderWithProvider(incomeActive = 3000) {
  return render(<AppProvider><Setup incomeActive={incomeActive} /></AppProvider>)
}

describe('Simulator integration', () => {
  it('renders capital futuro, ingreso pasivo, objetivo FIRE labels', () => {
    renderWithProvider()
    expect(screen.getByText(/capital futuro/i)).toBeInTheDocument()
    expect(screen.getByText(/ingreso pasivo/i)).toBeInTheDocument()
    expect(screen.getByText(/objetivo fire/i)).toBeInTheDocument()
  })

  it('changing withdrawal rate toggle updates FIRE target display', () => {
    render(
      <AppProvider>
        <Setup incomeActive={2000} />
      </AppProvider>
    )
    // With 4%: fireTarget = 24000 / 0.04 = 600.000
    expect(screen.getByText(/600\.000|600000/)).toBeInTheDocument()
  })

  it('yearsToFire section is shown', () => {
    renderWithProvider()
    expect(screen.getByText(/años para fire/i)).toBeInTheDocument()
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppProvider } from '../../context/AppContext'
import { FinanceBlocks } from './FinanceBlocks'
import { KpiStrip } from '../KpiStrip/KpiStrip'

function renderWithProvider(ui: React.ReactElement) {
  return render(<AppProvider>{ui}</AppProvider>)
}

describe('FinanceBlocks integration', () => {
  it('renders all four block section headings', () => {
    renderWithProvider(<FinanceBlocks />)
    expect(screen.getByText(/ingresos/i)).toBeInTheDocument()
    expect(screen.getByText(/gastos/i)).toBeInTheDocument()
    expect(screen.getByText(/activos/i)).toBeInTheDocument()
    expect(screen.getByText(/pasivos/i)).toBeInTheDocument()
  })

  it('adding an income value updates KPI strip total', () => {
    renderWithProvider(<><FinanceBlocks /><KpiStrip /></>)

    const amountInputs = screen.getAllByPlaceholderText('0')
    fireEvent.change(amountInputs[0], { target: { value: '2000' } })

    expect(screen.getByText(/2\.000/)).toBeInTheDocument()
  })

  it('shows a new empty row after filling in a row', () => {
    renderWithProvider(<FinanceBlocks />)
    const labelInputs = screen.getAllByPlaceholderText(/nombre/i)
    const initialCount = labelInputs.length
    fireEvent.change(labelInputs[0], { target: { value: 'Salario' } })
    const newLabelInputs = screen.getAllByPlaceholderText(/nombre/i)
    expect(newLabelInputs.length).toBeGreaterThan(initialCount)
  })
})

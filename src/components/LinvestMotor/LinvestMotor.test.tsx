import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppProvider } from '../../context/AppContext'
import { BudgetMotor } from './LinvestMotor'

function renderWithProvider() {
  return render(<AppProvider><BudgetMotor /></AppProvider>)
}

describe('BudgetMotor integration', () => {
  it('renders 5 allocation sliders', () => {
    renderWithProvider()
    expect(screen.getByLabelText(/gastos fijos/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gastos variables/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ahorro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/inversión/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/formación/i)).toBeInTheDocument()
  })

  it('default allocations sum to 100%', () => {
    renderWithProvider()
    const total = screen.getByTestId('budget-total')
    expect(total.textContent).toBe('100%')
  })

  it('changing a slider keeps sum at 100%', () => {
    renderWithProvider()
    const fixedSlider = screen.getByLabelText(/gastos fijos/i)
    fireEvent.change(fixedSlider, { target: { value: '50' } })
    const total = screen.getByTestId('budget-total')
    expect(total.textContent).toBe('100%')
  })
})

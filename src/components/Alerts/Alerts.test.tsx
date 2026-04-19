import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useEffect } from 'react'
import { AppProvider } from '../../context/AppContext'
import { Alerts } from './Alerts'
import { useAppContext } from '../../context/AppContext'
import { LineItem } from '../../types'

function Setup({ items }: { items: LineItem[] }) {
  const { dispatch } = useAppContext()
  useEffect(() => {
    items.forEach(item => dispatch({ type: 'SET_ITEM', payload: item }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Alerts />
}

function renderWith(items: LineItem[]) {
  return render(<AppProvider><Setup items={items} /></AppProvider>)
}

const id = () => crypto.randomUUID()

describe('Alerts integration', () => {
  it('shows green chip when housing ≤ 30%', () => {
    renderWith([
      { id: id(), type: 'incomeActive', label: 'S', amount: 3000 },
      { id: id(), type: 'expenseHousing', label: 'A', amount: 900 },
    ])
    const chip = screen.getByText(/vivienda/i)
    expect(chip.closest('.chip')?.classList.contains('chip--green')).toBe(true)
  })

  it('shows red chip when housing > 35%', () => {
    renderWith([
      { id: id(), type: 'incomeActive', label: 'S', amount: 1000 },
      { id: id(), type: 'expenseHousing', label: 'A', amount: 400 },
    ])
    const chip = screen.getByText(/vivienda/i)
    expect(chip.closest('.chip')?.classList.contains('chip--red')).toBe(true)
  })

  it('shows yellow chip when debt is 37% (between 36-40%)', () => {
    renderWith([
      { id: id(), type: 'incomeActive', label: 'S', amount: 1000 },
      { id: id(), type: 'expenseDebt', label: 'D', amount: 370 },
    ])
    const chip = screen.getByText(/deuda/i)
    expect(chip.closest('.chip')?.classList.contains('chip--yellow')).toBe(true)
  })

  it('shows passive income coverage as percentage', () => {
    renderWith([
      { id: id(), type: 'incomePassive', label: 'Div', amount: 500 },
      { id: id(), type: 'expenseOther', label: 'Exp', amount: 1000 },
    ])
    expect(screen.getByText(/50%/i)).toBeInTheDocument()
  })
})

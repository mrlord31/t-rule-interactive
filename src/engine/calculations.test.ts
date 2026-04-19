// src/engine/calculations.test.ts
import { describe, it, expect } from 'vitest'
import { calcMetrics, normalizeLinvest } from './calculations'
import { DEFAULT_STATE, State, LineItem, BudgetAllocation } from '../types'

const makeState = (overrides: Partial<State> = {}): State => ({
  ...DEFAULT_STATE,
  ...overrides,
})

const item = (partial: Partial<LineItem> & Pick<LineItem, 'type' | 'amount'>): LineItem => ({
  id: Math.random().toString(),
  label: 'Test',
  ...partial,
})

describe('totals', () => {
  it('returns all zeros for empty state', () => {
    const m = calcMetrics(makeState())
    expect(m.totalIncome).toBe(0)
    expect(m.totalExpenses).toBe(0)
    expect(m.netWorth).toBe(0)
    expect(m.freeCashFlow).toBe(0)
  })

  it('sums income active and passive separately', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomeActive', amount: 2000 }),
        item({ type: 'incomePassive', amount: 500 }),
      ],
    }))
    expect(m.totalIncomeActive).toBe(2000)
    expect(m.totalIncomePassive).toBe(500)
    expect(m.totalIncome).toBe(2500)
  })

  it('sums expense categories separately', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'expenseHousing', amount: 900 }),
        item({ type: 'expenseDebt', amount: 300 }),
        item({ type: 'expenseOther', amount: 200 }),
      ],
    }))
    expect(m.totalHousing).toBe(900)
    expect(m.totalDebt).toBe(300)
    expect(m.totalExpenses).toBe(1400)
  })

  it('calculates freeCashFlow as income minus expenses', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomeActive', amount: 3000 }),
        item({ type: 'expenseHousing', amount: 1000 }),
        item({ type: 'expenseOther', amount: 500 }),
      ],
    }))
    expect(m.freeCashFlow).toBe(1500)
  })

  it('splits assets into liquid, illiquid, investable', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'asset', amount: 30000, isLiquid: true, isInvestable: true }),
        item({ type: 'asset', amount: 15000, isLiquid: false, isInvestable: false }),
        item({ type: 'asset', amount: 5000, isLiquid: true, isInvestable: false }),
      ],
    }))
    expect(m.totalAssets).toBe(50000)
    expect(m.totalLiquidAssets).toBe(35000)
    expect(m.totalIlliquidAssets).toBe(15000)
    expect(m.totalInvestableAssets).toBe(30000)
  })

  it('calculates netWorth as assets minus liabilities', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'asset', amount: 50000 }),
        item({ type: 'liability', amount: 12000 }),
      ],
    }))
    expect(m.netWorth).toBe(38000)
  })
})

describe('ratios and alerts', () => {
  it('calculates housing ratio correctly', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomeActive', amount: 3000 }),
        item({ type: 'expenseHousing', amount: 900 }),
      ],
    }))
    expect(m.housingRatio).toBeCloseTo(0.3)
  })

  it('housing alert: green ≤30%, yellow 30-35%, red >35%', () => {
    const base = { type: 'incomeActive' as const, amount: 1000 }
    expect(calcMetrics(makeState({ items: [item(base), item({ type: 'expenseHousing', amount: 300 })] })).alertHousing).toBe('green')
    expect(calcMetrics(makeState({ items: [item(base), item({ type: 'expenseHousing', amount: 320 })] })).alertHousing).toBe('yellow')
    expect(calcMetrics(makeState({ items: [item(base), item({ type: 'expenseHousing', amount: 360 })] })).alertHousing).toBe('red')
  })

  it('debt alert: green ≤36%, yellow 36-40%, red >40%', () => {
    const base = { type: 'incomeActive' as const, amount: 1000 }
    expect(calcMetrics(makeState({ items: [item(base), item({ type: 'expenseDebt', amount: 360 })] })).alertDebt).toBe('green')
    expect(calcMetrics(makeState({ items: [item(base), item({ type: 'expenseDebt', amount: 380 })] })).alertDebt).toBe('yellow')
    expect(calcMetrics(makeState({ items: [item(base), item({ type: 'expenseDebt', amount: 410 })] })).alertDebt).toBe('red')
  })

  it('savings alert: green ≥20%, yellow 15-20%, red <15%', () => {
    const income = item({ type: 'incomeActive', amount: 1000 })
    expect(calcMetrics(makeState({ items: [income, item({ type: 'expenseOther', amount: 800 })] })).alertSavings).toBe('green')
    expect(calcMetrics(makeState({ items: [income, item({ type: 'expenseOther', amount: 830 })] })).alertSavings).toBe('yellow')
    expect(calcMetrics(makeState({ items: [income, item({ type: 'expenseOther', amount: 870 })] })).alertSavings).toBe('red')
  })

  it('passiveIncomeCoverage = totalIncomePassive / totalExpenses', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomePassive', amount: 400 }),
        item({ type: 'expenseOther', amount: 800 }),
      ],
    }))
    expect(m.passiveIncomeCoverage).toBeCloseTo(0.5)
  })

  it('passiveIncomeCoverage is 0 when expenses are 0 (no division by zero)', () => {
    const m = calcMetrics(makeState({ items: [item({ type: 'incomePassive', amount: 400 })] }))
    expect(m.passiveIncomeCoverage).toBe(0)
  })
})

describe('FIRE calculations', () => {
  it('fireTarget = annualTargetIncome / withdrawalRate (4%)', () => {
    const m = calcMetrics(makeState({
      items: [item({ type: 'incomeActive', amount: 2000 })],
    }))
    expect(m.fireTarget).toBe(600000)
  })

  it('fireTarget changes with 3% withdrawal rate', () => {
    const m = calcMetrics(makeState({
      items: [item({ type: 'incomeActive', amount: 2000 })],
      withdrawalRate: 0.03,
    }))
    expect(m.fireTarget).toBeCloseTo(800000)
  })

  it('fireProgress uses totalInvestableAssets, not totalAssets', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomeActive', amount: 1000 }),
        item({ type: 'asset', amount: 200000, isInvestable: true }),
        item({ type: 'asset', amount: 100000, isInvestable: false }),
      ],
    }))
    expect(m.totalInvestableAssets).toBe(200000)
    expect(m.fireProgress).toBeCloseTo(200000 / 300000)
  })

  it('fireStatus red when fireProgress < 25%', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomeActive', amount: 5000 }),
        item({ type: 'asset', amount: 10000, isInvestable: true }),
      ],
    }))
    expect(m.fireStatus).toBe('red')
  })

  it('fireStatus green when currentPassiveIncome4pct >= targetMonthlyIncome', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomeActive', amount: 1000 }),
        item({ type: 'asset', amount: 600000, isInvestable: true }),
      ],
    }))
    expect(m.fireStatus).toBe('green')
  })

  it('wealthNumber = (passiveIncome / expenses) * 12', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomePassive', amount: 500 }),
        item({ type: 'expenseOther', amount: 1000 }),
      ],
    }))
    expect(m.wealthNumber).toBeCloseTo(6)
  })

  it('wealthNumber is 0 when expenses are 0', () => {
    const m = calcMetrics(makeState({ items: [item({ type: 'incomePassive', amount: 500 })] }))
    expect(m.wealthNumber).toBe(0)
  })

  it('targetMonthlyIncome falls back to totalExpenses when totalIncomeActive is 0', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomePassive', amount: 7500 }),
        item({ type: 'expenseOther', amount: 3500 }),
      ],
      withdrawalRate: 0.04,
    }))
    expect(m.targetMonthlyIncome).toBe(3500)
    expect(m.fireTarget).toBeCloseTo(1_050_000)
    expect(m.fireProgress).toBeCloseTo(0)         // no investable assets
    expect(m.fireStatus).toBe('red')              // progress < 25%
  })

  it('yearsToFire is null when investable assets already meet fireTarget', () => {
    const m = calcMetrics(makeState({
      items: [
        item({ type: 'incomeActive', amount: 1000 }),
        item({ type: 'asset', amount: 999999, isInvestable: true }),
      ],
    }))
    expect(m.yearsToFire).toBeNull()
  })

  it('yearsToFire returns positive integer when not yet at goal', () => {
    const m = calcMetrics(makeState({
      items: [item({ type: 'incomeActive', amount: 2000 })],
      monthlyContribution: 500,
      riskProfile: 'balanced',
    }))
    expect(typeof m.yearsToFire).toBe('number')
    expect(m.yearsToFire).toBeGreaterThan(0)
  })
})

describe('compound interest simulation', () => {
  it('futureValue with no contribution equals P*(1+r)^n', () => {
    const state = makeState({
      items: [item({ type: 'asset', amount: 10000, isInvestable: true })],
      riskProfile: 'conservative',
      monthlyContribution: 0,
      yearsHorizon: 1,
    })
    const m = calcMetrics(state)
    const expected = 10000 * Math.pow(1 + 0.04 / 12, 12)
    expect(m.futureValue).toBeCloseTo(expected, 0)
  })

  it('yearlyProjection has yearsHorizon+1 entries (year 0 to N)', () => {
    const m = calcMetrics(makeState({ yearsHorizon: 20 }))
    expect(m.yearlyProjection).toHaveLength(21)
  })

  it('yearlyProjection is monotonically non-decreasing with positive contribution', () => {
    const m = calcMetrics(makeState({
      items: [item({ type: 'asset', amount: 1000, isInvestable: true })],
      monthlyContribution: 100,
      yearsHorizon: 10,
    }))
    for (let i = 1; i < m.yearlyProjection.length; i++) {
      expect(m.yearlyProjection[i].value).toBeGreaterThanOrEqual(m.yearlyProjection[i - 1].value)
    }
  })

  it('fireTargetLine is constant across all projection points', () => {
    const m = calcMetrics(makeState({
      items: [item({ type: 'incomeActive', amount: 2000 })],
      yearsHorizon: 10,
    }))
    const firstTarget = m.yearlyProjection[0].fireTargetLine
    expect(m.yearlyProjection.every(p => p.fireTargetLine === firstTarget)).toBe(true)
  })

  it('futurePassiveIncome uses withdrawalRate', () => {
    const state = makeState({
      items: [item({ type: 'asset', amount: 100000, isInvestable: true })],
      monthlyContribution: 0,
      yearsHorizon: 0,
      withdrawalRate: 0.03,
    })
    const m = calcMetrics(state)
    expect(m.futurePassiveIncome).toBeCloseTo((m.futureValue * 0.03) / 12, 0)
  })
})

describe('budget euros', () => {
  it('converts percentages to euros based on totalIncome', () => {
    const m = calcMetrics(makeState({
      items: [item({ type: 'incomeActive', amount: 2000 })],
      budget: { fixedExpenses: 40, variableExpenses: 20, savings: 15, investment: 20, education: 5 },
    }))
    expect(m.budgetEuros.fixedExpenses).toBe(800)
    expect(m.budgetEuros.investment).toBe(400)
    expect(m.budgetEuros.education).toBe(100)
  })

  it('budget euros are 0 when income is 0', () => {
    const m = calcMetrics(makeState())
    expect(m.budgetEuros.investment).toBe(0)
  })
})

describe('normalizeLinvest', () => {
  const base: BudgetAllocation = { fixedExpenses: 40, variableExpenses: 20, savings: 15, investment: 20, education: 5 }

  it('sum always equals 100 after adjustment', () => {
    const result = normalizeLinvest(base, 'investment', 30)
    const sum = Object.values(result).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(100)
  })

  it('sets the key to the new clamped value', () => {
    const result = normalizeLinvest(base, 'investment', 30)
    expect(result.investment).toBe(30)
  })

  it('clamps value to 0 minimum', () => {
    const result = normalizeLinvest(base, 'investment', -10)
    expect(result.investment).toBe(0)
  })

  it('clamps value to 100 maximum', () => {
    const result = normalizeLinvest(base, 'investment', 150)
    expect(result.investment).toBe(100)
  })

  it('handles totalOthers === 0 by distributing evenly', () => {
    const allZeroOthers: BudgetAllocation = { fixedExpenses: 0, variableExpenses: 0, savings: 0, investment: 0, education: 100 }
    const result = normalizeLinvest(allZeroOthers, 'education', 60)
    expect(result.education).toBe(60)
    const sum = Object.values(result).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(100, 0)
  })

  it('sum is 100 when diff correction is needed', () => {
    // Use values that cause floating point drift requiring correction
    const tricky: BudgetAllocation = { fixedExpenses: 33, variableExpenses: 33, savings: 11, investment: 11, education: 12 }
    const result = normalizeLinvest(tricky, 'savings', 12)
    const sum = Object.values(result).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(100)
  })

  it('no correction needed when sum is already exactly 100', () => {
    // With clean integer proportions the sum stays exactly 100 (diff === 0 path)
    const clean: BudgetAllocation = { fixedExpenses: 25, variableExpenses: 25, savings: 25, investment: 25, education: 0 }
    const result = normalizeLinvest(clean, 'education', 0)
    const sum = Object.values(result).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(100)
    expect(result.education).toBe(0)
  })
})

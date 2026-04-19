// src/engine/scenarios.test.ts
import { describe, it, expect } from 'vitest'
import { calcMetrics } from './calculations'
import { PRESET_TRABAJADORA, PRESET_MEDIA, PRESET_RICA } from '../data/presets'

// ─── Clase Trabajadora ────────────────────────────────────────────────────────
describe('Clase Trabajadora (Ana, 32a)', () => {
  const m = calcMetrics(PRESET_TRABAJADORA)

  it('income totals', () => {
    expect(m.totalIncomeActive).toBe(2500)
    expect(m.totalIncomePassive).toBe(0)
    expect(m.totalIncome).toBe(2500)
  })

  it('expense totals and free cash flow', () => {
    expect(m.totalHousing).toBe(750)
    expect(m.totalDebt).toBe(150)
    expect(m.totalExpenses).toBe(1700)
    expect(m.freeCashFlow).toBe(800)
  })

  it('balance sheet', () => {
    expect(m.totalAssets).toBe(5000)
    expect(m.totalLiquidAssets).toBe(5000)
    expect(m.totalIlliquidAssets).toBe(0)
    expect(m.totalInvestableAssets).toBe(2000)
    expect(m.totalLiabilities).toBe(5000)
    expect(m.netWorth).toBe(0)
  })

  it('ratios', () => {
    expect(m.housingRatio).toBeCloseTo(0.30, 5)   // 750/2500 = 30%
    expect(m.debtRatio).toBeCloseTo(0.06, 5)       // 150/2500 = 6%
    expect(m.savingsRatio).toBeCloseTo(0.32, 5)    // 800/2500 = 32%
    expect(m.passiveIncomeCoverage).toBe(0)        // 0/1700
  })

  it('alerts: all green', () => {
    expect(m.alertHousing).toBe('green')   // 30% = green boundary
    expect(m.alertDebt).toBe('green')
    expect(m.alertSavings).toBe('green')
  })

  it('FIRE', () => {
    expect(m.targetMonthlyIncome).toBe(2500)
    expect(m.fireTarget).toBeCloseTo(750_000)      // 2500*12/0.04
    expect(m.fireProgress).toBeCloseTo(2000 / 750_000)
    expect(m.fireStatus).toBe('red')               // progress < 25%
    expect(m.yearsToFire).toBeGreaterThan(0)
    expect(m.yearsToFire).not.toBeNull()
  })

  it('wealth number is 0 (no passive income)', () => {
    expect(m.wealthNumber).toBe(0)
  })
})

// ─── Clase Media ──────────────────────────────────────────────────────────────
describe('Clase Media (Carlos, 45a)', () => {
  const m = calcMetrics(PRESET_MEDIA)

  it('income totals', () => {
    expect(m.totalIncomeActive).toBe(4500)
    expect(m.totalIncomePassive).toBe(800)
    expect(m.totalIncome).toBe(5300)
  })

  it('expense totals and free cash flow', () => {
    expect(m.totalHousing).toBe(1200)
    expect(m.totalDebt).toBe(400)
    expect(m.totalExpenses).toBe(3100)
    expect(m.freeCashFlow).toBe(2200)
  })

  it('balance sheet', () => {
    expect(m.totalAssets).toBe(350_000)
    expect(m.totalLiquidAssets).toBe(120_000)
    expect(m.totalIlliquidAssets).toBe(230_000)    // 200k + 30k
    expect(m.totalInvestableAssets).toBe(120_000)
    expect(m.totalLiabilities).toBe(150_000)
    expect(m.netWorth).toBe(200_000)
  })

  it('ratios', () => {
    expect(m.housingRatio).toBeCloseTo(1200 / 5300, 5)   // ≈ 22.6%
    expect(m.debtRatio).toBeCloseTo(400 / 5300, 5)        // ≈ 7.5%
    expect(m.savingsRatio).toBeCloseTo(2200 / 5300, 5)    // ≈ 41.5%
    expect(m.passiveIncomeCoverage).toBeCloseTo(800 / 3100, 5)  // ≈ 25.8%
  })

  it('alerts: all green', () => {
    expect(m.alertHousing).toBe('green')
    expect(m.alertDebt).toBe('green')
    expect(m.alertSavings).toBe('green')
  })

  it('FIRE', () => {
    expect(m.targetMonthlyIncome).toBe(4500)
    expect(m.fireTarget).toBeCloseTo(1_350_000)           // 4500*12/0.04
    expect(m.fireProgress).toBeCloseTo(120_000 / 1_350_000)
    expect(m.fireStatus).toBe('red')                      // progress < 25%
    expect(m.yearsToFire).toBeGreaterThan(0)
    expect(m.yearsToFire).not.toBeNull()
  })

  it('wealth number ≈ 3.1 months (800€ passive / 3100€ expenses × 12)', () => {
    expect(m.wealthNumber).toBeCloseTo((800 / 3100) * 12, 2)
  })
})

// ─── Libre FIRE (Clase Rica) ──────────────────────────────────────────────────
describe('Libre FIRE (María, 55a)', () => {
  const m = calcMetrics(PRESET_RICA)

  it('income totals — only passive', () => {
    expect(m.totalIncomeActive).toBe(0)
    expect(m.totalIncomePassive).toBe(7500)
    expect(m.totalIncome).toBe(7500)
  })

  it('expense totals and free cash flow', () => {
    expect(m.totalHousing).toBe(500)
    expect(m.totalDebt).toBe(0)
    expect(m.totalExpenses).toBe(3500)
    expect(m.freeCashFlow).toBe(4000)
  })

  it('balance sheet', () => {
    expect(m.totalAssets).toBe(1_700_000)
    expect(m.totalLiquidAssets).toBe(600_000)
    expect(m.totalIlliquidAssets).toBe(1_100_000)   // 800k + 300k
    expect(m.totalInvestableAssets).toBe(600_000)
    expect(m.totalLiabilities).toBe(0)
    expect(m.netWorth).toBe(1_700_000)
  })

  it('ratios', () => {
    expect(m.housingRatio).toBeCloseTo(500 / 7500, 5)     // ≈ 6.7%
    expect(m.debtRatio).toBe(0)
    expect(m.savingsRatio).toBeCloseTo(4000 / 7500, 5)    // ≈ 53.3%
    expect(m.passiveIncomeCoverage).toBeCloseTo(7500 / 3500, 5)  // ≈ 214%
  })

  it('alerts: all green', () => {
    expect(m.alertHousing).toBe('green')
    expect(m.alertDebt).toBe('green')
    expect(m.alertSavings).toBe('green')
  })

  it('FIRE — target based on expenses (bug fix), not on 0 active income', () => {
    expect(m.targetMonthlyIncome).toBe(3500)              // falls back to totalExpenses
    expect(m.fireTarget).toBeCloseTo(1_050_000)           // 3500*12/0.04
    expect(m.fireProgress).toBeCloseTo(600_000 / 1_050_000)  // ≈ 57.1%
    expect(m.fireStatus).toBe('yellow')                   // 25% < progress < 75%, passive < target
    expect(m.yearsToFire).not.toBeNull()                  // not yet at 1.05M from portfolio alone
    expect(m.yearsToFire).toBeGreaterThan(0)
  })

  it('wealth number ≈ 25.7 months covered by passive income', () => {
    expect(m.wealthNumber).toBeCloseTo((7500 / 3500) * 12, 1)
  })
})

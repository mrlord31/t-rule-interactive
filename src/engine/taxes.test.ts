import { describe, it, expect } from 'vitest'
import { calcProgressive, calcTaxes, IP_MINIMO_EXENTO, IS_RATE,
         IRPF_GENERAL_BRACKETS, IRPF_AHORRO_BRACKETS } from './taxes'
import { LineItem } from '../types'

const item = (partial: Partial<LineItem> & Pick<LineItem, 'type' | 'amount'>): LineItem => ({
  id: Math.random().toString(), label: 'Test', ...partial,
})

// ── calcProgressive ────────────────────────────────────────────────────────────
describe('calcProgressive', () => {
  it('returns 0 for base 0', () => {
    expect(calcProgressive(0, IRPF_GENERAL_BRACKETS)).toBe(0)
  })

  it('returns 0 for negative base', () => {
    expect(calcProgressive(-500, IRPF_GENERAL_BRACKETS)).toBe(0)
  })

  it('applies single bracket when base is within first tramo', () => {
    // 10.000€ at 19% = 1.900€
    expect(calcProgressive(10_000, IRPF_GENERAL_BRACKETS)).toBeCloseTo(10_000 * 0.19, 1)
  })

  it('crosses two brackets correctly', () => {
    // 20.000€: 12.450×19% + 7.550×24% = 2.365,5 + 1.812 = 4.177,5
    const expected = 12_450 * 0.19 + (20_000 - 12_450) * 0.24
    expect(calcProgressive(20_000, IRPF_GENERAL_BRACKETS)).toBeCloseTo(expected, 1)
  })

  it('crosses three brackets correctly', () => {
    // 30.000€: 12.450×19% + 7.750×24% + 9.800×30%
    const expected = 12_450 * 0.19 + (20_200 - 12_450) * 0.24 + (30_000 - 20_200) * 0.30
    expect(calcProgressive(30_000, IRPF_GENERAL_BRACKETS)).toBeCloseTo(expected, 1)
  })

  it('works with ahorro brackets', () => {
    // 12.000€ ahorro: 6.000×19% + 6.000×21% = 1.140 + 1.260 = 2.400
    const expected = 6_000 * 0.19 + 6_000 * 0.21
    expect(calcProgressive(12_000, IRPF_AHORRO_BRACKETS)).toBeCloseTo(expected, 1)
  })
})

// ── Salary ────────────────────────────────────────────────────────────────────
describe('calcTaxes — salary (incomeActive default)', () => {
  it('applies IRPF general to incomeActive with no incomeType set', () => {
    // 2.500€/mes = 30.000€/año
    const result = calcTaxes([item({ type: 'incomeActive', amount: 2_500 })], 0)
    const expected = 12_450 * 0.19 + (20_200 - 12_450) * 0.24 + (30_000 - 20_200) * 0.30
    expect(result.irpfGeneral).toBeCloseTo(expected, 0)
    expect(result.irpfAhorro).toBe(0)
    expect(result.isEmpresa).toBe(0)
    expect(result.impuestoPatrimonio).toBe(0)
  })

  it('effectiveTaxRate = totalAnnualTax / (grossMonthlyIncome × 12)', () => {
    const result = calcTaxes([item({ type: 'incomeActive', amount: 2_500 })], 0)
    expect(result.effectiveTaxRate).toBeCloseTo(
      result.totalAnnualTax / (result.grossMonthlyIncome * 12), 5
    )
  })

  it('netMonthlyIncome = grossMonthlyIncome - totalMonthlyTax', () => {
    const result = calcTaxes([item({ type: 'incomeActive', amount: 2_500 })], 0)
    expect(result.netMonthlyIncome).toBeCloseTo(
      result.grossMonthlyIncome - result.totalMonthlyTax, 2
    )
  })

  it('grossMonthlyIncome equals sum of income items', () => {
    const result = calcTaxes([
      item({ type: 'incomeActive', amount: 2_000 }),
      item({ type: 'incomePassive', amount: 500 }),
    ], 0)
    expect(result.grossMonthlyIncome).toBe(2_500)
  })
})

// ── Dividendos ────────────────────────────────────────────────────────────────
describe('calcTaxes — dividends (incomePassive default)', () => {
  it('applies IRPF ahorro to incomePassive with no incomeType set', () => {
    const result = calcTaxes([item({ type: 'incomePassive', amount: 1_000 })], 0)
    expect(result.irpfGeneral).toBe(0)
    expect(result.irpfAhorro).toBeGreaterThan(0)
    expect(result.isEmpresa).toBe(0)
  })

  it('applies correct ahorro brackets to 12.000€/year', () => {
    // 1.000€/mes = 12.000€/año: 6.000×19% + 6.000×21% = 2.400
    const result = calcTaxes([item({ type: 'incomePassive', amount: 1_000, incomeType: 'dividends' })], 0)
    expect(result.irpfAhorro).toBeCloseTo(6_000 * 0.19 + 6_000 * 0.21, 1)
  })
})

// ── Alquiler ──────────────────────────────────────────────────────────────────
describe('calcTaxes — rental income', () => {
  it('applies full base general with no reduction when isResidentialRental is false', () => {
    // 1.000€/mes = 12.000€ → base = 12.000 → IRPF general: 12.000×19% = 2.280
    const result = calcTaxes(
      [item({ type: 'incomePassive', amount: 1_000, incomeType: 'rental', isResidentialRental: false })],
      0
    )
    expect(result.irpfGeneral).toBeCloseTo(12_000 * 0.19, 1)
  })

  it('applies 50% reduction when isResidentialRental is true', () => {
    // 1.000€/mes = 12.000€ → base = 6.000 (×0.5) → IRPF general: 6.000×19% = 1.140
    const result = calcTaxes(
      [item({ type: 'incomePassive', amount: 1_000, incomeType: 'rental', isResidentialRental: true })],
      0
    )
    expect(result.irpfGeneral).toBeCloseTo(6_000 * 0.19, 1)
  })

  it('residential rental pays less tax than non-residential same gross', () => {
    const noRed = calcTaxes([item({ type: 'incomePassive', amount: 1_000, incomeType: 'rental', isResidentialRental: false })], 0)
    const withRed = calcTaxes([item({ type: 'incomePassive', amount: 1_000, incomeType: 'rental', isResidentialRental: true })], 0)
    expect(withRed.irpfGeneral).toBeLessThan(noRed.irpfGeneral)
  })

  it('rental is taxed in general base, not ahorro', () => {
    const result = calcTaxes([item({ type: 'incomePassive', amount: 1_000, incomeType: 'rental' })], 0)
    expect(result.irpfAhorro).toBe(0)
    expect(result.irpfGeneral).toBeGreaterThan(0)
  })
})

// ── Empresa ───────────────────────────────────────────────────────────────────
describe('calcTaxes — company dividends (IS chain)', () => {
  it('applies IS 25% then IRPF ahorro on net after IS', () => {
    // 4.000€/mes = 48.000€/año → IS: 12.000 → neto: 36.000 → ahorro: 6k×19% + 30k×21% = 7.440
    const result = calcTaxes(
      [item({ type: 'incomePassive', amount: 4_000, incomeType: 'company_dividends' })],
      0
    )
    expect(result.isEmpresa).toBeCloseTo(48_000 * IS_RATE, 1)
    const netAfterIs = 48_000 * (1 - IS_RATE)
    const expectedAhorro = 6_000 * 0.19 + (netAfterIs - 6_000) * 0.21
    expect(result.irpfAhorro).toBeCloseTo(expectedAhorro, 1)
  })

  it('empresa total tax is higher than direct dividends for same gross', () => {
    const directDiv = calcTaxes([item({ type: 'incomePassive', amount: 1_000, incomeType: 'dividends' })], 0)
    const empresa = calcTaxes([item({ type: 'incomePassive', amount: 1_000, incomeType: 'company_dividends' })], 0)
    expect(empresa.totalAnnualTax).toBeGreaterThan(directDiv.totalAnnualTax)
  })
})

// ── Impuesto Patrimonio ───────────────────────────────────────────────────────
describe('calcTaxes — Impuesto Patrimonio', () => {
  it('returns 0 when netWorth = 0', () => {
    expect(calcTaxes([], 0).impuestoPatrimonio).toBe(0)
  })

  it('returns 0 when netWorth equals IP_MINIMO_EXENTO exactly', () => {
    expect(calcTaxes([], IP_MINIMO_EXENTO).impuestoPatrimonio).toBe(0)
  })

  it('returns 0 when netWorth is below IP_MINIMO_EXENTO', () => {
    expect(calcTaxes([], 500_000).impuestoPatrimonio).toBe(0)
  })

  it('applies 0.2% on first bracket above exento', () => {
    // netWorth = 700.000 + 167.129 = 867.129 → gravable = 167.129 → 167.129 × 0.002
    const result = calcTaxes([], IP_MINIMO_EXENTO + 167_129)
    expect(result.impuestoPatrimonio).toBeCloseTo(167_129 * 0.002, 0)
  })

  it('crosses two IP brackets correctly', () => {
    // netWorth = 700.000 + 334.252 → gravable = 334.252
    // 167.129×0.002 + (334.252−167.129)×0.003
    const gravable = 334_252
    const expected = 167_129 * 0.002 + (gravable - 167_129) * 0.003
    const result = calcTaxes([], IP_MINIMO_EXENTO + gravable)
    expect(result.impuestoPatrimonio).toBeCloseTo(expected, 0)
  })
})

// ── Edge cases ────────────────────────────────────────────────────────────────
describe('calcTaxes — edge cases', () => {
  it('returns all zeros for empty state', () => {
    const result = calcTaxes([], 0)
    expect(result.irpfGeneral).toBe(0)
    expect(result.irpfAhorro).toBe(0)
    expect(result.isEmpresa).toBe(0)
    expect(result.impuestoPatrimonio).toBe(0)
    expect(result.totalAnnualTax).toBe(0)
    expect(result.effectiveTaxRate).toBe(0)
    expect(result.netMonthlyIncome).toBe(0)
    expect(result.sourceBreakdown).toHaveLength(0)
  })

  it('ignores expense/asset/liability items', () => {
    const result = calcTaxes([
      item({ type: 'expenseHousing', amount: 1_000 }),
      item({ type: 'expenseDebt', amount: 200 }),
      item({ type: 'expenseGoodDebt', amount: 400 }),
      item({ type: 'asset', amount: 50_000 }),
      item({ type: 'liability', amount: 10_000 }),
    ], 0)
    expect(result.totalAnnualTax).toBe(0)
    expect(result.grossMonthlyIncome).toBe(0)
    expect(result.sourceBreakdown).toHaveLength(0)
  })

  it('sourceBreakdown has one entry per income item', () => {
    const result = calcTaxes([
      item({ type: 'incomeActive', amount: 2_000 }),
      item({ type: 'incomePassive', amount: 500, incomeType: 'dividends' }),
      item({ type: 'incomePassive', amount: 300, incomeType: 'rental' }),
    ], 0)
    // 3 income items + possibly 1 patrimonio row (but netWorth=0 so no IP)
    expect(result.sourceBreakdown).toHaveLength(3)
  })

  it('sourceBreakdown adds patrimonio row when IP > 0', () => {
    const result = calcTaxes(
      [item({ type: 'incomeActive', amount: 1_000 })],
      IP_MINIMO_EXENTO + 200_000
    )
    const patrimonioRow = result.sourceBreakdown.find(s => s.category === 'patrimonio')
    expect(patrimonioRow).toBeDefined()
    expect(patrimonioRow!.taxMonthly).toBeGreaterThan(0)
  })

  it('totalAnnualTax = irpfGeneral + irpfAhorro + isEmpresa + impuestoPatrimonio', () => {
    const result = calcTaxes([
      item({ type: 'incomeActive', amount: 2_000 }),
      item({ type: 'incomePassive', amount: 500, incomeType: 'dividends' }),
    ], IP_MINIMO_EXENTO + 100_000)
    expect(result.totalAnnualTax).toBeCloseTo(
      result.irpfGeneral + result.irpfAhorro + result.isEmpresa + result.impuestoPatrimonio, 1
    )
  })

  it('sourceBreakdown categories are correctly assigned per income type', () => {
    const result = calcTaxes([
      item({ type: 'incomeActive', amount: 1_000 }),
      item({ type: 'incomePassive', amount: 500, incomeType: 'dividends' }),
      item({ type: 'incomePassive', amount: 300, incomeType: 'rental' }),
      item({ type: 'incomePassive', amount: 400, incomeType: 'company_dividends' }),
    ], 0)
    const categories = result.sourceBreakdown.map(s => s.category)
    expect(categories).toContain('general')
    expect(categories).toContain('ahorro')
    expect(categories).toContain('empresa')
  })
})

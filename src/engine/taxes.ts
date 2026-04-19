import { LineItem, TaxSummary, TaxSourceBreakdown } from '../types'

export const IRPF_GENERAL_BRACKETS: [number, number][] = [
  [12_450,    0.19],
  [20_200,    0.24],
  [35_200,    0.30],
  [60_000,    0.37],
  [300_000,   0.45],
  [Infinity,  0.47],
]

export const IRPF_AHORRO_BRACKETS: [number, number][] = [
  [6_000,    0.19],
  [50_000,   0.21],
  [200_000,  0.23],
  [300_000,  0.27],
  [Infinity, 0.30],
]

export const IP_BRACKETS: [number, number][] = [
  [167_129,    0.002],
  [334_252,    0.003],
  [668_500,    0.005],
  [1_337_000,  0.009],
  [2_674_000,  0.013],
  [5_348_000,  0.017],
  [10_696_000, 0.021],
  [Infinity,   0.035],
]

export const IP_MINIMO_EXENTO = 700_000
export const IS_RATE = 0.25

export function calcProgressive(base: number, brackets: [number, number][]): number {
  if (base <= 0) return 0
  let tax = 0
  let remaining = base
  let prev = 0
  for (const [limit, rate] of brackets) {
    const tramo = Math.min(remaining, limit - prev)
    if (tramo <= 0) break
    tax += tramo * rate
    remaining -= tramo
    prev = limit
    if (remaining <= 0) break
  }
  return tax
}

export function calcTaxes(items: LineItem[], netWorth: number): TaxSummary {
  const incomeItems = items.filter(
    i => i.type === 'incomeActive' || i.type === 'incomePassive'
  )

  // First pass: accumulate tax bases
  let annualBaseGeneral = 0
  let annualBaseAhorro = 0
  let annualIsEmpresa = 0

  for (const item of incomeItems) {
    const annual = item.amount * 12
    const type = item.incomeType
      ?? (item.type === 'incomeActive' ? 'salary' : 'dividends')

    if (type === 'salary') {
      annualBaseGeneral += annual
    } else if (type === 'rental') {
      annualBaseGeneral += annual * (item.isResidentialRental ? 0.5 : 1)
    } else if (type === 'dividends') {
      annualBaseAhorro += annual
    } else if (type === 'company_dividends') {
      const is = annual * IS_RATE
      annualIsEmpresa += is
      annualBaseAhorro += annual - is
    }
  }

  // Calculate taxes
  const irpfGeneral = calcProgressive(annualBaseGeneral, IRPF_GENERAL_BRACKETS)
  const irpfAhorro = calcProgressive(annualBaseAhorro, IRPF_AHORRO_BRACKETS)
  const patrimonioGravable = Math.max(0, netWorth - IP_MINIMO_EXENTO)
  const impuestoPatrimonio = calcProgressive(patrimonioGravable, IP_BRACKETS)

  const totalAnnualTax = irpfGeneral + irpfAhorro + annualIsEmpresa + impuestoPatrimonio
  const grossAnnualIncome = incomeItems.reduce((s, i) => s + i.amount * 12, 0)

  // Per-source breakdown (pro-rata approximation)
  const sourceBreakdown: TaxSourceBreakdown[] = incomeItems.map(item => {
    const annual = item.amount * 12
    const type = item.incomeType ?? (item.type === 'incomeActive' ? 'salary' : 'dividends')
    let taxAnnual = 0
    let category: TaxSourceBreakdown['category'] = 'general'

    if (type === 'salary') {
      taxAnnual = annualBaseGeneral > 0 ? irpfGeneral * (annual / annualBaseGeneral) : 0
      category = 'general'
    } else if (type === 'rental') {
      const reduction = item.isResidentialRental ? 0.5 : 1
      taxAnnual = annualBaseGeneral > 0 ? irpfGeneral * ((annual * reduction) / annualBaseGeneral) : 0
      category = 'general'
    } else if (type === 'dividends') {
      taxAnnual = annualBaseAhorro > 0 ? irpfAhorro * (annual / annualBaseAhorro) : 0
      category = 'ahorro'
    } else if (type === 'company_dividends') {
      const is = annual * IS_RATE
      const netAfterIs = annual - is
      taxAnnual = is + (annualBaseAhorro > 0 ? irpfAhorro * (netAfterIs / annualBaseAhorro) : 0)
      category = 'empresa'
    }

    return {
      label: item.label,
      grossMonthly: item.amount,
      taxMonthly: taxAnnual / 12,
      netMonthly: item.amount - taxAnnual / 12,
      category,
    }
  })

  if (impuestoPatrimonio > 0) {
    sourceBreakdown.push({
      label: 'Imp. Patrimonio',
      grossMonthly: 0,
      taxMonthly: impuestoPatrimonio / 12,
      netMonthly: -(impuestoPatrimonio / 12),
      category: 'patrimonio',
    })
  }

  return {
    irpfGeneral,
    irpfAhorro,
    isEmpresa: annualIsEmpresa,
    impuestoPatrimonio,
    totalAnnualTax,
    totalMonthlyTax: totalAnnualTax / 12,
    effectiveTaxRate: grossAnnualIncome > 0 ? totalAnnualTax / grossAnnualIncome : 0,
    grossMonthlyIncome: grossAnnualIncome / 12,
    netMonthlyIncome: grossAnnualIncome / 12 - totalAnnualTax / 12,
    sourceBreakdown,
  }
}

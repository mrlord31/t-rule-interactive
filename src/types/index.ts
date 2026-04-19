export type EntryType =
  | 'incomeActive'
  | 'incomePassive'
  | 'expenseHousing'
  | 'expenseDebt'
  | 'expenseGoodDebt'
  | 'expenseOther'
  | 'asset'
  | 'liability'

export interface LineItem {
  id: string
  type: EntryType
  label: string
  amount: number
  isInvestable?: boolean
  isLiquid?: boolean
  incomeType?: 'salary' | 'rental' | 'dividends' | 'company_dividends'
  isResidentialRental?: boolean
}

export interface BudgetAllocation {
  fixedExpenses: number
  variableExpenses: number
  savings: number
  investment: number
  education: number
}

export type WithdrawalRate = 0.04 | 0.03

export interface State {
  items: LineItem[]
  riskProfile: 'conservative' | 'balanced' | 'aggressive'
  withdrawalRate: WithdrawalRate
  desiredMonthlyIncome: number | null
  monthlyContribution: number
  manualContributionOverride: boolean
  yearsHorizon: number
  budget: BudgetAllocation
}

export interface YearlyProjectionPoint {
  year: number
  value: number
  contributions: number
  fireTargetLine: number
}

export interface TaxSourceBreakdown {
  label: string
  grossMonthly: number
  taxMonthly: number
  netMonthly: number
  category: 'general' | 'ahorro' | 'empresa' | 'patrimonio'
}

export interface TaxSummary {
  irpfGeneral: number
  irpfAhorro: number
  isEmpresa: number
  impuestoPatrimonio: number
  totalAnnualTax: number
  totalMonthlyTax: number
  effectiveTaxRate: number
  grossMonthlyIncome: number
  netMonthlyIncome: number
  sourceBreakdown: TaxSourceBreakdown[]
}

export interface CalculatedMetrics {
  totalIncomeActive: number
  totalIncomePassive: number
  totalIncome: number
  totalExpenses: number
  totalHousing: number
  totalDebt: number
  totalGoodDebt: number
  freeCashFlow: number
  totalAssets: number
  totalLiquidAssets: number
  totalIlliquidAssets: number
  totalInvestableAssets: number
  totalLiabilities: number
  netWorth: number

  housingRatio: number
  debtRatio: number
  savingsRatio: number
  passiveIncomeCoverage: number
  alertHousing: 'green' | 'yellow' | 'red'
  alertDebt: 'green' | 'yellow' | 'red'
  alertSavings: 'green' | 'yellow' | 'red'

  effectiveWithdrawalRate: number
  targetMonthlyIncome: number
  annualTargetIncome: number
  fireTarget: number
  fireProgress: number
  currentPassiveIncome4pct: number
  passiveIncomeSurplusOrGap: number
  fireStatus: 'red' | 'yellow' | 'green'
  wealthNumber: number
  yearsToFire: number | null

  initialCapital: number
  futureValue: number
  totalContributions: number
  totalReturns: number
  futurePassiveIncome: number
  yearlyProjection: YearlyProjectionPoint[]

  budgetEuros: {
    fixedExpenses: number
    variableExpenses: number
    savings: number
    investment: number
    education: number
  }

  taxes: TaxSummary
}

export const RISK_PROFILE_RETURNS: Record<State['riskProfile'], number> = {
  conservative: 0.04,
  balanced: 0.07,
  aggressive: 0.10,
}

export const DEFAULT_STATE: State = {
  items: [],
  riskProfile: 'balanced',
  withdrawalRate: 0.04,
  desiredMonthlyIncome: null,
  monthlyContribution: 0,
  manualContributionOverride: false,
  yearsHorizon: 20,
  budget: {
    fixedExpenses: 40,
    variableExpenses: 20,
    savings: 15,
    investment: 20,
    education: 5,
  },
}

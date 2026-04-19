import {
  State,
  CalculatedMetrics,
  LineItem,
  RISK_PROFILE_RETURNS,
  YearlyProjectionPoint,
} from '../types'
import { calcTaxes } from './taxes'

function sumBy(items: LineItem[], predicate: (item: LineItem) => boolean): number {
  return items.filter(predicate).reduce((acc, i) => acc + i.amount, 0)
}

function alertThreshold(
  value: number,
  greenMax: number,
  yellowMax: number
): 'green' | 'yellow' | 'red' {
  if (value <= greenMax) return 'green'
  if (value <= yellowMax) return 'yellow'
  return 'red'
}

function alertSavingsRatio(ratio: number): 'green' | 'yellow' | 'red' {
  if (ratio >= 0.20) return 'green'
  if (ratio >= 0.15) return 'yellow'
  return 'red'
}

export function calcMetrics(state: State): CalculatedMetrics {
  const { items, riskProfile, withdrawalRate, desiredMonthlyIncome,
          monthlyContribution, yearsHorizon, budget } = state

  const totalIncomeActive = sumBy(items, i => i.type === 'incomeActive')
  const totalIncomePassive = sumBy(items, i => i.type === 'incomePassive')
  const totalIncome = totalIncomeActive + totalIncomePassive
  const totalHousing = sumBy(items, i => i.type === 'expenseHousing')
  const totalDebt = sumBy(items, i => i.type === 'expenseDebt')
  const totalGoodDebt = sumBy(items, i => i.type === 'expenseGoodDebt')
  const totalExpensesOther = sumBy(items, i => i.type === 'expenseOther')
  const totalExpenses = totalHousing + totalDebt + totalGoodDebt + totalExpensesOther
  const freeCashFlow = totalIncome - totalExpenses

  const totalAssets = sumBy(items, i => i.type === 'asset')
  const totalLiquidAssets = sumBy(items, i => i.type === 'asset' && i.isLiquid === true)
  const totalIlliquidAssets = sumBy(items, i => i.type === 'asset' && i.isLiquid === false)
  const totalInvestableAssets = sumBy(items, i => i.type === 'asset' && i.isInvestable === true)
  const totalLiabilities = sumBy(items, i => i.type === 'liability')
  const netWorth = totalAssets - totalLiabilities

  const housingRatio = totalIncome > 0 ? totalHousing / totalIncome : 0
  const debtRatio = totalIncome > 0 ? totalDebt / totalIncome : 0
  const savingsRatio = totalIncome > 0 ? freeCashFlow / totalIncome : 0
  const passiveIncomeCoverage = totalExpenses > 0 ? totalIncomePassive / totalExpenses : 0

  const aHousing = alertThreshold(housingRatio, 0.30, 0.35)
  const aDebt = alertThreshold(debtRatio, 0.36, 0.40)
  const aSavings = alertSavingsRatio(savingsRatio)

  const targetMonthlyIncome = desiredMonthlyIncome
    ?? (totalIncomeActive > 0 ? totalIncomeActive : totalExpenses)
  const annualTargetIncome = targetMonthlyIncome * 12
  const fireTarget = annualTargetIncome / withdrawalRate
  const fireProgress = fireTarget > 0 ? Math.min(totalInvestableAssets / fireTarget, 1) : 0
  const currentPassiveIncome4pct = (totalInvestableAssets * withdrawalRate) / 12
  const passiveIncomeSurplusOrGap = currentPassiveIncome4pct - targetMonthlyIncome

  const fireStatus: 'red' | 'yellow' | 'green' =
    fireProgress >= 0.75 || currentPassiveIncome4pct >= targetMonthlyIncome
      ? 'green'
      : fireProgress >= 0.25
      ? 'yellow'
      : 'red'

  const wealthNumber = totalExpenses > 0 ? (totalIncomePassive / totalExpenses) * 12 : 0

  const annualRate = RISK_PROFILE_RETURNS[riskProfile]
  const monthlyRate = annualRate / 12
  const totalMonths = yearsHorizon * 12
  const P = totalInvestableAssets
  const C = monthlyContribution

  const fvGrowth = monthlyRate === 0 ? 1 : Math.pow(1 + monthlyRate, totalMonths)
  /* v8 ignore next 3 */
  const futureValue = monthlyRate === 0
    ? P + C * totalMonths
    : P * fvGrowth + C * ((fvGrowth - 1) / monthlyRate)

  const totalContributions = P + C * totalMonths
  const totalReturns = futureValue - totalContributions
  const futurePassiveIncome = (futureValue * withdrawalRate) / 12

  const yearlyProjection: YearlyProjectionPoint[] = []
  for (let y = 0; y <= yearsHorizon; y++) {
    const n = y * 12
    const g = monthlyRate === 0 ? 1 : Math.pow(1 + monthlyRate, n)
    /* v8 ignore next 3 */
    const val = monthlyRate === 0
      ? P + C * n
      : P * g + C * ((g - 1) / monthlyRate)
    yearlyProjection.push({
      year: y,
      value: Math.round(val),
      contributions: Math.round(P + C * n),
      fireTargetLine: Math.round(fireTarget),
    })
  }

  // Years to FIRE (iterate monthly until FV >= fireTarget)
  let yearsToFire: number | null = null
  if (fireTarget <= 0 || totalInvestableAssets >= fireTarget) {
    yearsToFire = null // already reached
  } else {
    let fv = P
    for (let m = 1; m <= 100 * 12; m++) {
      /* v8 ignore next 3 */
      fv = monthlyRate === 0
        ? fv + C
        : fv * (1 + monthlyRate) + C
      if (fv >= fireTarget) {
        yearsToFire = Math.ceil(m / 12)
        break
      }
    }
    if (yearsToFire === null) yearsToFire = 100 // cap
  }

  const budgetEuros = {
    fixedExpenses: totalIncome * budget.fixedExpenses / 100,
    variableExpenses: totalIncome * budget.variableExpenses / 100,
    savings: totalIncome * budget.savings / 100,
    investment: totalIncome * budget.investment / 100,
    education: totalIncome * budget.education / 100,
  }

  const taxes = calcTaxes(items, netWorth)

  return {
    totalIncomeActive, totalIncomePassive, totalIncome,
    totalExpenses, totalHousing, totalDebt, totalGoodDebt, freeCashFlow,
    totalAssets, totalLiquidAssets, totalIlliquidAssets,
    totalInvestableAssets, totalLiabilities, netWorth,
    housingRatio, debtRatio, savingsRatio, passiveIncomeCoverage,
    alertHousing: aHousing, alertDebt: aDebt, alertSavings: aSavings,
    effectiveWithdrawalRate: withdrawalRate,
    targetMonthlyIncome, annualTargetIncome, fireTarget,
    fireProgress, currentPassiveIncome4pct, passiveIncomeSurplusOrGap,
    fireStatus, wealthNumber, yearsToFire,
    initialCapital: P, futureValue, totalContributions, totalReturns,
    futurePassiveIncome, yearlyProjection,
    budgetEuros,
    taxes,
  }
}

export function normalizeLinvest(
  current: import('../types').BudgetAllocation,
  key: keyof import('../types').BudgetAllocation,
  newValue: number
): import('../types').BudgetAllocation {
  const clamped = Math.max(0, Math.min(100, newValue))
  const delta = clamped - current[key]
  const others = (Object.keys(current) as Array<keyof typeof current>).filter(k => k !== key)
  const totalOthers = others.reduce((s, k) => s + current[k], 0)

  const updated = { ...current, [key]: clamped }
  if (totalOthers === 0) {
    const share = Math.round(-delta / others.length)
    others.forEach(k => { updated[k] = Math.max(0, current[k] + share) })
  } else {
    others.forEach(k => {
      const proportion = current[k] / totalOthers
      updated[k] = Math.max(0, Math.round((current[k] - delta * proportion) * 100) / 100)
    })
  }

  // force exact sum to 100
  const sum = (Object.values(updated) as number[]).reduce((a, b) => a + b, 0)
  const diff = Math.round((100 - sum) * 100) / 100
  if (diff !== 0) {
    /* v8 ignore next */
    const largest = others.reduce((a, b) => updated[a] >= updated[b] ? a : b)
    updated[largest] = Math.max(0, Math.round((updated[largest] + diff) * 100) / 100)
  }

  return updated
}

import { State } from '../types'

export const PRESET_TRABAJADORA: State = {
  items: [
    { id: 'wk-ia-1', type: 'incomeActive',    label: 'Salario',              amount: 2500 },
    { id: 'wk-eh-1', type: 'expenseHousing',  label: 'Alquiler',             amount: 750 },
    { id: 'wk-ed-1', type: 'expenseDebt',     label: 'Préstamo coche',       amount: 150 },
    { id: 'wk-eo-1', type: 'expenseOther',    label: 'Gastos vida',          amount: 800 },
    { id: 'wk-as-1', type: 'asset',           label: 'Cuenta corriente',     amount: 3000,   isLiquid: true,  isInvestable: false },
    { id: 'wk-af-1', type: 'asset',           label: 'Fondo indexado',       amount: 2000,   isLiquid: true,  isInvestable: true  },
    { id: 'wk-li-1', type: 'liability',       label: 'Préstamo coche',       amount: 5000 },
  ],
  riskProfile: 'balanced',
  withdrawalRate: 0.04,
  desiredMonthlyIncome: null,
  monthlyContribution: 500,
  manualContributionOverride: false,
  yearsHorizon: 30,
  budget: { fixedExpenses: 40, variableExpenses: 20, savings: 15, investment: 20, education: 5 },
}

export const PRESET_MEDIA: State = {
  items: [
    { id: 'md-ia-1', type: 'incomeActive',    label: 'Salario',              amount: 4500 },
    { id: 'md-ip-1', type: 'incomePassive',   label: 'Alquiler piso',        amount: 800  },
    { id: 'md-eh-1', type: 'expenseHousing',  label: 'Hipoteca',             amount: 1200 },
    { id: 'md-ed-1', type: 'expenseDebt',     label: 'Préstamo personal',    amount: 400  },
    { id: 'md-eo-1', type: 'expenseOther',    label: 'Gastos vida',          amount: 1500 },
    { id: 'md-af-1', type: 'asset',           label: 'ETF / Fondos',         amount: 120000, isLiquid: true,  isInvestable: true  },
    { id: 'md-ai-1', type: 'asset',           label: 'Piso alquiler',        amount: 200000, isLiquid: false, isInvestable: false },
    { id: 'md-ap-1', type: 'asset',           label: 'Plan de pensiones',    amount: 30000,  isLiquid: false, isInvestable: false },
    { id: 'md-li-1', type: 'liability',       label: 'Hipoteca',             amount: 150000 },
  ],
  riskProfile: 'balanced',
  withdrawalRate: 0.04,
  desiredMonthlyIncome: null,
  monthlyContribution: 1000,
  manualContributionOverride: false,
  yearsHorizon: 20,
  budget: { fixedExpenses: 40, variableExpenses: 20, savings: 15, investment: 20, education: 5 },
}

export const PRESET_RICA: State = {
  items: [
    { id: 'rc-ip-1', type: 'incomePassive',   label: 'Dividendos empresa',   amount: 4000 },
    { id: 'rc-ip-2', type: 'incomePassive',   label: 'Fondos indexados',     amount: 2000 },
    { id: 'rc-ip-3', type: 'incomePassive',   label: 'Alquiler',             amount: 1500 },
    { id: 'rc-eh-1', type: 'expenseHousing',  label: 'Mantenimiento vivienda', amount: 500 },
    { id: 'rc-eo-1', type: 'expenseOther',    label: 'Gastos vida',          amount: 3000 },
    { id: 'rc-af-1', type: 'asset',           label: 'Portfolio fondos',     amount: 600000, isLiquid: true,  isInvestable: true  },
    { id: 'rc-ai-1', type: 'asset',           label: 'Inmuebles',            amount: 800000, isLiquid: false, isInvestable: false },
    { id: 'rc-ai-2', type: 'asset',           label: 'Participación empresa', amount: 300000, isLiquid: false, isInvestable: false },
  ],
  riskProfile: 'aggressive',
  withdrawalRate: 0.04,
  desiredMonthlyIncome: null,
  monthlyContribution: 2000,
  manualContributionOverride: false,
  yearsHorizon: 10,
  budget: { fixedExpenses: 40, variableExpenses: 20, savings: 15, investment: 20, education: 5 },
}

export const PRESET_INVERSOR: State = {
  items: [
    { id: 'inv-ip-1', type: 'incomePassive', label: 'Alquiler piso 1', amount: 1200, incomeType: 'rental', isResidentialRental: true },
    { id: 'inv-ip-2', type: 'incomePassive', label: 'Alquiler piso 2', amount: 1200, incomeType: 'rental', isResidentialRental: true },
    { id: 'inv-ip-3', type: 'incomePassive', label: 'Alquiler piso 3', amount: 1200, incomeType: 'rental', isResidentialRental: true },
    { id: 'inv-ip-4', type: 'incomePassive', label: 'Dividendos fondos', amount: 800, incomeType: 'dividends' },
    { id: 'inv-eh-1', type: 'expenseHousing', label: 'Mantenimiento vivienda', amount: 300 },
    { id: 'inv-gd-1', type: 'expenseGoodDebt', label: 'Hipoteca piso 1', amount: 400 },
    { id: 'inv-gd-2', type: 'expenseGoodDebt', label: 'Hipoteca piso 2', amount: 400 },
    { id: 'inv-gd-3', type: 'expenseGoodDebt', label: 'Hipoteca piso 3', amount: 400 },
    { id: 'inv-eo-1', type: 'expenseOther', label: 'Gastos vida', amount: 1500 },
    { id: 'inv-af-1', type: 'asset', label: 'Fondos indexados', amount: 80000, isLiquid: true, isInvestable: true },
    { id: 'inv-ai-1', type: 'asset', label: 'Piso inversión 1', amount: 180000, isLiquid: false, isInvestable: false },
    { id: 'inv-ai-2', type: 'asset', label: 'Piso inversión 2', amount: 180000, isLiquid: false, isInvestable: false },
    { id: 'inv-ai-3', type: 'asset', label: 'Piso inversión 3', amount: 180000, isLiquid: false, isInvestable: false },
    { id: 'inv-li-1', type: 'liability', label: 'Hipoteca piso 1', amount: 100000 },
    { id: 'inv-li-2', type: 'liability', label: 'Hipoteca piso 2', amount: 100000 },
    { id: 'inv-li-3', type: 'liability', label: 'Hipoteca piso 3', amount: 100000 },
  ],
  riskProfile: 'balanced',
  withdrawalRate: 0.04,
  desiredMonthlyIncome: null,
  monthlyContribution: 1400,
  manualContributionOverride: false,
  yearsHorizon: 15,
  budget: { fixedExpenses: 40, variableExpenses: 20, savings: 15, investment: 20, education: 5 },
}

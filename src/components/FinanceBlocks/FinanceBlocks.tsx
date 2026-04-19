import { BlockTable } from './BlockTable'

const HELP_INGRESOS = `Registra tus ingresos mensuales netos.

🟢 Ingresos activos: salario, freelance, negocio que requiere tu tiempo.
🟢 Ingresos pasivos: alquiler, dividendos, intereses, regalías.

Para los ingresos pasivos, usa el icono para indicar el tipo fiscal:
📈 Dividendos/Fondos → base del ahorro (19–30%)
🏠 Alquiler → base general (con reducción 50% si es residencial, botón R50/NR)
🏢 Empresa → IS 25% + base ahorro sobre dividendos

Si cobras trimestral o anual, divide entre 3 o 12.`

const HELP_GASTOS = `Gastos de vivienda y vida: alquiler/hipoteca propia, suministros, alimentación, ocio.

Umbral vivienda saludable ≤ 30% de ingresos.`

const HELP_DEUDA_MALA = `Deuda que drena tu bolsillo sin generar ingresos.

Ejemplos: préstamo coche, tarjeta de crédito, préstamo personal de consumo.

Umbral saludable ≤ 36% de ingresos. Esta deuda SUBE la alerta de deuda.`

const HELP_DEUDA_BUENA = `Deuda que se paga con los ingresos que genera.

Ejemplo: hipoteca de un inmueble de alquiler. El alquiler cubre la cuota y sobra beneficio.

Esta deuda NO penaliza la alerta de deuda. Aparece separada para mayor claridad.`

const HELP_ACTIVOS = `Registra el valor actual de mercado de tus activos.

💧 Líquido (L): efectivo, ETFs, acciones, fondos indexados — fácil de vender.
🏗️ Ilíquido (I): vivienda propia, coche, negocio no cotizado.
✦ Invertible: genera rentabilidad financiera (activa para ETFs, fondos, inmueble de alquiler).

La rentabilidad anual esperada se toma del perfil de riesgo:
• Conservador: 4% · Moderado: 7% · Agresivo: 10%

Solo los activos ✦ cuentan para el objetivo FIRE.`

const HELP_PASIVOS = `Registra el saldo pendiente total de tus deudas.

Ejemplos: hipoteca pendiente, préstamo personal, saldo tarjeta de crédito.

⚠️ Pon el total adeudado, no la cuota mensual (eso va en Gastos).`

export function FinanceBlocks() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <BlockTable
        title="▲ Ingresos"
        color="var(--color-income)"
        types={['incomeActive', 'incomePassive']}
        showIncomeTypeToggle
        helpText={HELP_INGRESOS}
      />
      <BlockTable
        title="▼ Gastos"
        color="var(--color-expense)"
        types={['expenseHousing', 'expenseOther']}
        helpText={HELP_GASTOS}
      />
      <BlockTable
        title="💳 Deuda mala"
        color="var(--color-liability)"
        types={['expenseDebt']}
        helpText={HELP_DEUDA_MALA}
      />
      <BlockTable
        title="✅ Deuda buena"
        color="var(--color-income)"
        types={['expenseGoodDebt']}
        helpText={HELP_DEUDA_BUENA}
      />
      <BlockTable
        title="◆ Activos"
        color="var(--color-asset)"
        types={['asset']}
        showLiquidToggle
        showInvestableToggle
        helpText={HELP_ACTIVOS}
      />
      <BlockTable
        title="◇ Pasivos"
        color="var(--color-liability)"
        types={['liability']}
        helpText={HELP_PASIVOS}
      />
    </div>
  )
}

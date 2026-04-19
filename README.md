# T-Rule Interactive

**[🚀 Abrir aplicación](https://mrlord31.github.io/t-rule-interactive/)**

Dashboard de finanzas personales de página única orientado al mercado español. Calcula salud financiera, proyecta la independencia financiera (FIRE), estima la carga fiscal (IRPF, IS, Impuesto Patrimonio) y visualiza el flujo del dinero en tiempo real. Todo el cálculo ocurre en el navegador — sin backend, sin registro, sin dependencias externas.

> ⚠️ Herramienta de autoconocimiento financiero. No constituye asesoría financiera ni fiscal. Para decisiones de inversión consulta a un asesor certificado.

---

## ¿Qué hay en el dashboard?

### Barra de KPIs

Siete métricas instantáneas siempre visibles en la parte superior:

| Chip | Qué muestra |
|---|---|
| Ingresos | Suma de todos los ingresos mensuales (activos + pasivos) |
| Gastos | Total de gastos incluyendo deuda buena y mala |
| Flujo Libre | Ingresos − Gastos (cash flow mensual disponible) |
| Neto/mes | Ingresos después de impuestos estimados |
| Activos | Valor de mercado total de activos |
| Pasivos | Total de deudas pendientes |
| Patrimonio | Activos − Pasivos |

### Bloques financieros (columna izquierda)

Tablas editables donde se registra la situación actual. Cada fila tiene nombre, importe y controles opcionales:

- **Ingresos** — activos (salario, freelance) y pasivos. Para los ingresos pasivos, un botón cicla entre tres tipos fiscales: 📈 Dividendos/Fondos (base ahorro), 🏠 Alquiler (base general, con toggle R50/NR para reducción 50% en alquiler residencial), 🏢 Empresa (IS 25% + IRPF ahorro).
- **Gastos** — vivienda/vida (contribuye al ratio vivienda) y otros gastos corrientes.
- **Deuda mala** — préstamos de consumo, tarjetas. Penaliza la alerta de deuda.
- **Deuda buena** — hipotecas de inversión que se pagan con sus propios ingresos. No penaliza la alerta de deuda.
- **Activos** — con toggle Líquido (L) / Ilíquido (I) y toggle Invertible (✦). Solo los activos invertibles entran en el cálculo FIRE.
- **Pasivos** — saldo pendiente total de cada deuda.

### Diagrama de flujo

Visualización SVG del ciclo del dinero: trabajo → ingresos activos → gastos / activos → ingresos pasivos. Muestra el estado FIRE actual (rojo / amarillo / verde) y el porcentaje de cobertura de gastos con ingresos pasivos.

### Alertas de salud financiera

Tres indicadores con umbrales basados en referencias de planificación financiera personal:

| Alerta | Verde | Amarillo | Rojo |
|---|---|---|---|
| Vivienda | ≤ 30% ingresos | 30–35% | > 35% |
| Deuda | ≤ 36% ingresos | 36–40% | > 40% |
| Ahorro | ≥ 20% ingresos | 15–20% | < 15% |

Cada alerta incluye un tooltip con recomendaciones accionables.

### Estimación fiscal (España 2025)

Tabla por fuente de ingresos con columnas Bruto / Impuesto / Neto. Desglose:

- **IRPF base general** — aplicable a salario y alquiler (con reducción 50% si es residencial). Tramos 2025: 19 / 24 / 30 / 37 / 45 / 47%.
- **IRPF base ahorro** — aplicable a dividendos y fondos. Tramos 2025: 19 / 21 / 23 / 27 / 30%.
- **IS + IRPF ahorro (cadena empresa)** — para dividendos de sociedad: IS 25% sobre bruto, después IRPF ahorro sobre el neto resultante.
- **Impuesto Patrimonio** — mínimo exento 700.000 €, tramos progresivos 0,2%–3,5%.

Visible solo cuando hay ingresos registrados. Incluye tipo efectivo y disclamer sobre variaciones por CCAA.

### Motor de Presupuesto

Cinco sliders de porcentaje que suman 100%: gastos fijos, gastos variables, ahorro, inversión, formación. Los euros correspondientes se calculan en tiempo real sobre los ingresos totales. El porcentaje de inversión se usa para pre-rellenar la aportación mensual del simulador.

### Simulador FIRE + proyección

- **Objetivo FIRE**: `Capital = Ingreso objetivo anual / Tasa de retiro` (4% Trinity Study o 3% conservador).
- **Proyección compuesta**: `FV = P·(1+r)ⁿ + C·[(1+r)ⁿ−1]/r` con capital inicial = activos invertibles, aportación mensual editable y horizonte configurable.
- **Años hasta FIRE**: iteración mensual hasta que el capital proyectado supera el objetivo.
- **Gráfico**: curva de valor futuro vs línea objetivo FIRE.
- **Wealth Number**: `(Ingresos pasivos / Gastos) × 12` — meses al año que los activos cubren el gasto. 12 = libertad financiera hoy.

### Escenarios de ejemplo (TopBar)

Cuatro botones de carga rápida que ilustran perfiles financieros distintos:

| Preset | Perfil |
|---|---|
| 👷 Trabajadora | Salario 2.500 €, sin pasivos, inicio de acumulación |
| 🏠 Clase Media | Salario 4.500 € + alquiler, hipoteca, ETFs en crecimiento |
| 💼 Libre FIRE | Solo ingresos pasivos, patrimonio > 1 M€, FIRE próximo |
| 🏗️ Inversor | 3 pisos en alquiler con hipotecas buenas + dividendos |

---

## Arquitectura técnica

```
AppContext (useReducer)
  └── State
       ├── items: LineItem[]          — todas las filas del dashboard
       ├── riskProfile                — conservador / moderado / agresivo
       ├── withdrawalRate             — 4% o 3%
       ├── monthlyContribution        — aportación al simulador
       ├── yearsHorizon               — horizonte de simulación
       └── budget: BudgetAllocation   — porcentajes del motor de presupuesto

calcMetrics(state) → CalculatedMetrics   ← función pura, cero imports React
     └── useMetrics() hook
          └── Componentes de visualización (solo leen, nunca calculan)
```

La lógica de negocio vive íntegramente en `src/engine/`. Los componentes no calculan nada.

### Ficheros principales

| Fichero | Responsabilidad |
|---|---|
| `src/engine/calculations.ts` | Motor principal: ratios, FIRE, proyección compuesta |
| `src/engine/taxes.ts` | Cálculo fiscal español: IRPF, IS, Patrimonio |
| `src/types/index.ts` | Contratos de tipos: `State`, `CalculatedMetrics`, `TaxSummary` |
| `src/context/AppContext.tsx` | Estado global + reducer + acciones |
| `src/data/presets.ts` | Cuatro escenarios de ejemplo completos |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | React 18 + TypeScript |
| Bundler | Vite |
| Gráficos | Recharts |
| Estado | `useReducer` + Context API |
| Estilos | CSS custom properties (tema oscuro / claro) |
| Tests | Vitest + React Testing Library |
| Cobertura | v8 — motor de cálculo cubierto al 100% |

---

## Ejecutar en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # suite completa
npm run coverage   # cobertura del motor de cálculo
```

---

## Aviso legal

Esta herramienta es únicamente para fines educativos e informativos. No constituye asesoramiento financiero, fiscal ni de inversión. Los resultados son proyecciones basadas en supuestos y no garantizan rendimientos futuros. Consulta siempre a un asesor financiero certificado antes de tomar decisiones de inversión. Los tipos impositivos mostrados corresponden al ejercicio 2025 y pueden variar por comunidad autónoma y situación personal.

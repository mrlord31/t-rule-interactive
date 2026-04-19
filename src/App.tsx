import { TopBar } from './components/TopBar/TopBar'
import { KpiStrip } from './components/KpiStrip/KpiStrip'
import { FinanceBlocks } from './components/FinanceBlocks/FinanceBlocks'
import { FlowDiagram } from './components/FlowDiagram/FlowDiagram'
import { Alerts } from './components/Alerts/Alerts'
import { TaxSummary } from './components/TaxSummary/TaxSummary'
import { BudgetMotor } from './components/BudgetMotor/BudgetMotor'
import { Simulator } from './components/Simulator/Simulator'
import { Footer } from './components/Footer/Footer'

export default function App() {
  return (
    <div id="app-root">
      <TopBar />
      <KpiStrip />
      <div className="main-grid">
        {/* Left: editable blocks */}
        <FinanceBlocks />

        {/* Right: Flow + Alerts + Budget + Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          <FlowDiagram />
          <Alerts />
          <TaxSummary />
          <BudgetMotor />
          <Simulator />
        </div>
      </div>
      <Footer />
    </div>
  )
}

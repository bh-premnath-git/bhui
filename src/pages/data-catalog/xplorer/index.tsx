import { DashboardProvider } from "@/context/XploreDashboardContext"
import { AnalyticsProvider } from "@/context/AnalyticsContext"
import Dashboard from "@/features/data-catalog/xplorer/Dashboard"
const Xplorer = () => {
  return (
    <DashboardProvider>
      <AnalyticsProvider>
        <Dashboard />
      </AnalyticsProvider>
    </DashboardProvider>
  )
}

export default Xplorer
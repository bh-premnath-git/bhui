import { DashboardProvider } from "@/context/XploreDashboardContext"
import { AnalyticsProvider } from "@/context/AnalyticsContext"
import SavedDashboard from "@/features/others/saved-dashboard/savedDashboard"

const index = () => {
  return (
    <DashboardProvider>
      <AnalyticsProvider>
        <SavedDashboard />
      </AnalyticsProvider>
      </DashboardProvider>
  )
}

export default index
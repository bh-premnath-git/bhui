import { DashboardProvider } from "@/context/DashboardContext"
import Dashboard from "@/features/dataops/dashboard"

const DashboardComponent = () => {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  )
}
export default DashboardComponent

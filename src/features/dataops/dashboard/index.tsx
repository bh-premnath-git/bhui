import { DashboardHeader } from './DashboardHeader'
import { DashboardLayout } from './DashboardLayout'

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="pt-2">
      <DashboardHeader />
      </div>
      <main className="flex-1">
        <DashboardLayout />
      </main>
    </div>
  )
}

export default Dashboard
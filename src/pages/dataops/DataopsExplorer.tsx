import { Xplorer } from "@/features/dataops/Xplorer"
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";
const DataopsExplorer = () => {
  return (
    <div className="min-h-screen p-1 bg-background">
      <DashboardProvider>
        <AnalyticsProvider>
          <Xplorer />
        </AnalyticsProvider>
      </DashboardProvider>
    </div>
  )
}

export default withPageErrorBoundary(DataopsExplorer, 'DataopsExplorer');

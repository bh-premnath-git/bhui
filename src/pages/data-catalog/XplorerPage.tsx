import { Xplorer } from "@/features/data-catalog/Xplorer"
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";

const XplorerPage = () => {
  return (
    <div className="min-h-screen p-4 bg-background">
      <DashboardProvider>
        <AnalyticsProvider>
          <Xplorer />
        </AnalyticsProvider>
      </DashboardProvider>
    </div>
  )
}

export default withPageErrorBoundary(XplorerPage, 'XplorerPage');
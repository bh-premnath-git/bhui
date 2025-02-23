import { Xplorer } from "@/features/data-catalog/Xplorer"
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";

const XploreerPage = () => {
  return (
    <div className="min-h-screen p-6 bg-background">
      <AnalyticsProvider>
        <DashboardProvider>
          <Xplorer />
        </DashboardProvider>
      </AnalyticsProvider>
    </div>
  )
}

export default withPageErrorBoundary(XploreerPage, 'XploreerPage');
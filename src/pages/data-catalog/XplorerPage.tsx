import { Xplorer } from "@/features/data-catalog/Xplorer"
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { Helmet } from "react-helmet";

const XplorerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Data Explorer</title>
      </Helmet>
      
      <AnalyticsProvider>
        <DashboardProvider>
          <Xplorer />
        </DashboardProvider>
      </AnalyticsProvider>
    </div>
  )
}

export default withPageErrorBoundary(XplorerPage, 'XplorerPage'); 
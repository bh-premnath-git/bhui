import { Helmet } from "react-helmet";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";
import Xplorer from "@/features/data-catalog/components/Xplore/Xplorer";

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

export default XplorerPage; 
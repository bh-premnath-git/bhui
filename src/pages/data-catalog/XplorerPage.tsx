import { Xplorer } from "@/features/data-catalog/Xplorer"
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";

const XplorerMockPage = () => {
  return (
    <div className="p-2">
      <DashboardProvider>
        <AnalyticsProvider>
          <Xplorer />
        </AnalyticsProvider>
      </DashboardProvider>
    </div>
  )
}

export default withPageErrorBoundary(XplorerMockPage, 'XplorerMockPage');
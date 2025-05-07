import { XplorerMock } from "@/features/data-catalog/XplorerMock"
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";

const XplorerMockPage = () => {
  return (
    <div className="min-h-screen p-1 bg-background">
      <DashboardProvider>
        <AnalyticsProvider>
          <XplorerMock />
        </AnalyticsProvider>
      </DashboardProvider>
    </div>
  )
}

export default withPageErrorBoundary(XplorerMockPage, 'XplorerMockPage');
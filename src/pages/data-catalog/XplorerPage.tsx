import { Xplorer } from "@/features/data-catalog/Xplorer"
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { useLocation } from 'react-router-dom';

const XplorerPage = () => {
  const location = useLocation();
  return (
    <div className="p-2">
      <DashboardProvider>
        <AnalyticsProvider>
          <Xplorer key={location.key || 'default'} />
        </AnalyticsProvider>
      </DashboardProvider>
    </div>
  )
}

export default withPageErrorBoundary(XplorerPage, 'XplorerPage');
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { AlertsHub } from '@/features/dataops/AlertsHub';
function AlertsHubPage() {
    return <AlertsHub />;
}

export default withPageErrorBoundary(AlertsHubPage, 'AlertsHub');
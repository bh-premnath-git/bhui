import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { OpsHub } from '@/features/dataops/OpsHub';
function OpsHubPage() {
  return <OpsHub />;
}

export default withPageErrorBoundary(OpsHubPage, 'OpsHub');
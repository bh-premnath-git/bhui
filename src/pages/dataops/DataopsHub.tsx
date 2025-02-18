import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { DataOpsHub } from '@/features/dataops/DataOpsHub';
function DataOpsHubPage() {
    return (
        <DataOpsHub />
    )
}

export default withPageErrorBoundary(DataOpsHubPage, 'DataOpsHub');
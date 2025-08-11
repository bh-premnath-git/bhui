import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import { DataOpsHub } from '@/features/dataops/DataOpsHub';
function DataOpsHubPage() {
    return (
        <DataOpsHub />
    )
}

export default withPageErrorBoundary(DataOpsHubPage, 'DataOpsHub');
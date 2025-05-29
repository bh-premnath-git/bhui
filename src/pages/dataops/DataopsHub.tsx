import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import { DataOpsProvider } from "@/context/dataops/DataOpsContext"
import { DataOpsHub } from '@/features/dataops/DataOpsHub';
function DataOpsHubPage() {
    return (
        <DataOpsProvider>
            <DataOpsHub />
        </DataOpsProvider>
    )
}

export default withPageErrorBoundary(DataOpsHubPage, 'DataOpsHub');
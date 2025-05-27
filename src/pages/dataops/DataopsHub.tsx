import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { DataOpsProvider } from "@/context/dataops/DataOpsContext"
import { DataOpsHub } from '@/features/dataops/DataOpsHub';
function DataOpsHubPage() {
    return (
        <div className="pt-4">
            <DataOpsProvider>
                <DataOpsHub />
            </DataOpsProvider>
        </div>
    )
}

export default withPageErrorBoundary(DataOpsHubPage, 'DataOpsHub');
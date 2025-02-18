import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { DataOpsProvider } from "@/context/dataops/DataOpsContext"
import Dashboard from "@/features/dataops/dashboard"

function DataOpsHub() {
  return (
    <DataOpsProvider>
      <Dashboard />
    </DataOpsProvider>
  );
}

export default withPageErrorBoundary(DataOpsHub, 'DataOpsHub');

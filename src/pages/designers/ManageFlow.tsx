import { useEffect, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { FlowList } from '@/features/designers/ManageFlow';
import { useFlowManagementService } from '@/features/designers/flow/services/flowMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { useFlow } from '@/features/designers/flow/hooks/useFlow';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchProjects, fetchEnvironments } from '@/store/slices/designer/flowSlice';
import { Button } from '@/components/ui/button';
import { CreateFlowDialog } from '@/features/designers/flow/components/CreateFlowDialog';

function ManageFlowPage() {
  const dispatch = useAppDispatch();
  const { fetchFlowsList } = useFlow();
  const flowService = useFlowManagementService();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: flows = [],
    isLoading,
    isFetching,
    isError
  } = fetchFlowsList(true);

  const noFlows = !Array.isArray(flows) || flows.length === 0;

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchEnvironments());
  }, [dispatch]);

  useEffect(() => {
    if (!noFlows) {
      flowService.setFlows(flows);
    }
  }, [noFlows, flows, flowService]);

  if (isLoading) {
    return (
      <div className="p-6">
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error Loading Flows"
          description="There was an error loading the flows. Please try again later."
        />
      </div>
    );
  }

  if (noFlows) {
    return (
      <div className="p-6">
        <EmptyState
          Icon={GitBranch}
          title="No Flows Found"
          description="Get started by creating a new flow."
          action={
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4"
            >
              Create Flow
            </Button>
          }
        />
        <CreateFlowDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {isFetching && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingState className="w-40 h-40" />
        </div>
      )}
      <FlowList flows={flows} />
    </div>
  );
}

export default withPageErrorBoundary(ManageFlowPage, 'ManageFlow');

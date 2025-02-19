import { useEffect } from 'react';
import { GitBranch  } from 'lucide-react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { FlowList } from '@/features/designers/ManageFlow';
import { useFlowManagementService } from '@/features/designers/flow/services/flowMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { useFlow } from '@/features/designers/flow/hooks/useFlow';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

export function ManageFlowPage() {
    const { flows, isLoading, isFetching, isError } = useFlow();
    const flowService = useFlowManagementService();

    useEffect(() => {
        if(flows && flows.length > 0) {
            flowService.setFlows(flows);
        }
    }, [flows]);

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
                <ErrorState message="Something went wrong" />
            </div>
        );
    }

    if (!flows || flows.length === 0) {
        return (
            <div className="p-6">
                <EmptyState
                    title="Welcome to Flow Management!"
                    description="Ready to manage your flows."
                    Icon={GitBranch}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="relative">
                {isFetching && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <LoadingState className='w-40 h-40' />
                    </div>
                )}
                <FlowList flows={flows || []} />
            </div>
        </div>
    );
}

export default withPageErrorBoundary(ManageFlowPage, 'ManageFlow')
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { FlowList } from '@/features/designers/ManageFlow';
import { useFlowManagementService } from '@/features/designers/flow/services/flowMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { useFlow } from '@/features/designers/flow/hooks/useFlow';
import { useEffect } from 'react';
import exp from 'constants';

export function ManageFlowPage() {
    const { flows, isFetching } = useFlow();
    const flowService = useFlowManagementService();

    useEffect(() => {
        if(flows && flows.length > 0) {
            flowService.setFlows(flows);
        }
    }, [flows]);

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
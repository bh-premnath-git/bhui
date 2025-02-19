import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { useEffect } from 'react';
import { OpsHub } from '@/features/dataops/OpsHub';
import { useDataOpsHubManagementService } from '@/features/dataops/dataOpsHubs/services/dataOpsHubMgtSrv';
import { useDataOpsHub } from '@/features/dataops/dataOpsHubs/hooks/usedataOpsHub';

function OpsHubPage() {
    const { dataOpsHub, isLoading, isFetching, isError } = useDataOpsHub();
    const dataOpsHubSrv = useDataOpsHubManagementService();
    useEffect(() => {
        if(dataOpsHub && dataOpsHub.length > 0){
            dataOpsHubSrv.setDataOpsHubs(dataOpsHub);
        }
    }, []);
    return (
        <div className="p-6">
            <div className="relative">
                {isFetching && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <LoadingState className='w-40 h-40' />
                  </div>
                )}
                <OpsHub dataOpsHubs={dataOpsHub || []} />
            </div>
        </div>
        
    );
}

export default withPageErrorBoundary(OpsHubPage, 'OpsHub');
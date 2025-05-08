import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { useEffect } from 'react';
import { AlertsHub } from '@/features/dataops/AlertsHub';
import { useAlertHubManagementService } from '@/features/dataops/alertsHubs/services/alertsHubMgtSrv';
import { useAlertHub } from '@/features/dataops/alertsHubs/hooks/usealertHub';

function AlertsHubPage() {
    const { alertHub, isLoading, isFetching, isError } = useAlertHub();
    const alertHubSrv = useAlertHubManagementService();
    useEffect(() => {
        if(alertHub && alertHub.length > 0){
            alertHubSrv.setAlertHubs(alertHub);
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
                <AlertsHub alertHubs={alertHub || []} />
            </div>
        </div>
        
    );
}

export default withPageErrorBoundary(AlertsHubPage, 'AlertsHub');
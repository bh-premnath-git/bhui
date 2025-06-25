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
                    <LoadingState fullScreen={true} className="bg-background/50 backdrop-blur-sm" />
                )}
                <AlertsHub alertHubs={alertHub || []} />
            </div>
        </div>
        
    );
}

export default withPageErrorBoundary(AlertsHubPage, 'AlertsHub');
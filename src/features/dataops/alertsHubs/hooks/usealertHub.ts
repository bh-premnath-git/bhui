import { useResource } from "@/hooks/api/useResource";
import { AlertHub } from "@/types/dataops/alertsHub";
import { MONITOR_REMOTE_URL } from "@/config/platformenv";

interface UseAlertHubOptions {
    shouldFetch?: boolean;
}

export const useAlertHub = (options: UseAlertHubOptions = { shouldFetch: true }) => {
    const {
        getAll,
    } = useResource<AlertHub>('alert', MONITOR_REMOTE_URL, true);

    const { data: alertHub, isLoading, isFetching, isError } = getAll({ url: '/alert/' });


    return {
        alertHub,
        isLoading,
        isFetching,
        isError,
    };
}

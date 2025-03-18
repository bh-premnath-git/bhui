import { useResource } from "@/hooks/api/useResource";
import { AlertHub } from "@/types/dataops/alertsHub";
import { MONITOR_PORT } from "@/config/platformenv";

interface UseAlertHubOptions {
    shouldFetch?: boolean;
}

export const useAlertHub = (options: UseAlertHubOptions = { shouldFetch: true }) => {
    const {
        getAll,
    } = useResource<AlertHub>('alert', MONITOR_PORT, true);

    const { data: alertHub, isLoading, isFetching, isError } = getAll({ url: '/alert/' });


    return {
        alertHub,
        isLoading,
        isFetching,
        isError,
    };
}

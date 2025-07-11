// import { useResource } from "@/hooks/api/useResource";
// import { AlertHub } from "@/types/dataops/alertsHub";
// import { MONITOR_REMOTE_URL } from "@/config/platformenv";

// interface UseAlertHubOptions {
//     shouldFetch?: boolean;
// }

// export const useAlertHub = (options: UseAlertHubOptions = { shouldFetch: true }) => {
//     const {
//         getAll,
//     } = useResource<AlertHub>('alert', MONITOR_REMOTE_URL, true);

//     const { data: alertHub, isLoading, isFetching, isError } = getAll({ url: '/alert/' });


//     return {
//         alertHub,
//         isLoading,
//         isFetching,
//         isError,
//     };
// }

import { useCallback } from 'react';
import { useResource } from "@/hooks/api/useResource";
import { AlertHub } from "@/types/dataops/alertsHub";
import { MONITOR_REMOTE_URL } from "@/config/platformenv";
import { toast } from 'sonner';

interface UseAlertHubOptions {
  shouldFetch?: boolean;
}

export const useAlertHub = (options: UseAlertHubOptions = { shouldFetch: true }) => {
  const {
    getAll,
    update,
  } = useResource<AlertHub>('alert', MONITOR_REMOTE_URL, true);

  // Fetch all alerts
  const { data: alertHub, isLoading, isFetching, isError, error} = getAll({
    url: '/alert/',
    queryOptions: {
      enabled: options.shouldFetch,
      retry: 2,
    },
  });

  // console.log(alertHub);
  // Update alert mutation
  const updateAlertMutation = update('/alert', {
    mutationOptions: {
      onSuccess: () => toast.success('Alert updated successfully'),
      onError: (err) => {
        console.error('Update failed', err);
        toast.error('Failed to update alert');
      },
    },
  });
  const handleUpdateAlert = useCallback(async (id: string, data: AlertHub) => {
    await updateAlertMutation.mutateAsync({ data, params: { id } });
  }, [updateAlertMutation]);

  return {
    alertHub: alertHub ?? [],
    isLoading,
    isFetching,
    isError,
    error,
    handleUpdateAlert,
  };
};

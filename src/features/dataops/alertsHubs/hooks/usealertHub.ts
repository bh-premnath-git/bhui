import { useCallback } from 'react';
import { useResource } from "@/hooks/api/useResource";
import { AlertHub } from "@/types/dataops/alertsHub";
import { MONITOR_REMOTE_URL } from "@/config/platformenv";
import { apiService } from "@/lib/api/api-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
 
interface UseAlertHubOptions {
  shouldFetch?: boolean;
}
 
export const useAlertHub = (_options: UseAlertHubOptions = { shouldFetch: true }) => {
  const { getAll } = useResource<AlertHub>("alert", MONITOR_REMOTE_URL, true);
  const queryClient = useQueryClient();
 
  const {
    data: alertHub,
    isLoading,
    isFetching,
    isError,
  } = getAll({ url: "/alert/" });
 
  const updateAlert = useMutation({
    mutationFn: async (
      alert: Partial<AlertHub> & { alert_Id: string }
    ): Promise<AlertHub> => {
      const { alert_Id, ...rest } = alert;
      const response = await apiService.patch<AlertHub>({
        baseUrl: MONITOR_REMOTE_URL,
        url: `/alert/${alert_Id}/`,
        method: "PATCH",
        data: rest,
        usePrefix: true,
      });
      return response;
    },
    // Optimistic update to avoid refetch
    onMutate: async (newAlert) => {
      await queryClient.cancelQueries({ queryKey: ["alert", "list"] });
     
      const previousAlerts = queryClient.getQueryData<AlertHub[]>(["alert", "list", "{}"]);
     
      if (previousAlerts) {
        queryClient.setQueryData<AlertHub[]>(["alert", "list", "{}"], (old) => {
          if (!old) return old;
          return old.map(alert =>
            alert.alert_id === newAlert.alert_Id
              ? { ...alert, ...newAlert }
              : alert
          );
        });
      }
     
      return { previousAlerts };
    },
    onError: (err, newAlert, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(["alert", "list", "{}"], context.previousAlerts);
      }
    },
  });
  return {
    alertHub,
    isLoading,
    isFetching,
    isError,
    updateAlert
  };
};

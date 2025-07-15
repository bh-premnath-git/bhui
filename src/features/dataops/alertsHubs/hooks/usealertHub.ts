import { useResource } from "@/hooks/api/useResource";
import { AlertHub } from "@/types/dataops/alertsHub";
import { MONITOR_REMOTE_URL } from "@/config/platformenv";
import { apiService } from "@/lib/api/api-service";
import { useMutation } from "@tanstack/react-query";

interface UseAlertHubOptions {
  shouldFetch?: boolean;
}

export const useAlertHub = (_options: UseAlertHubOptions = { shouldFetch: true }) => {
  const { getAll } = useResource<AlertHub>("alert", MONITOR_REMOTE_URL, true);

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
      method: "PATCH",  // PATCH for partial updates
      data: rest,
      usePrefix: true,
    });
    return response;
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
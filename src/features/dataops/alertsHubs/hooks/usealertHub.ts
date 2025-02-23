import { useResource } from "@/hooks/api/useResource";
import { AlertHub } from "@/types/dataops/alertsHub";
import { toast } from "sonner";
import { MONITOR_PORT } from "@/config/platformenv";

interface UseAlertHubOptions {
  shouldFetch?: boolean;
}

export const useAlertHub = (options: UseAlertHubOptions = { shouldFetch: true }) => {
    const {
        getAll,
        createMutation,
        updateMutation,
        deleteMutation
    } = useResource<AlertHub>('alert', MONITOR_PORT, true);

    const { data: alertHub, isLoading, isFetching, isError } = getAll('/alert/');
    const updateOne = updateMutation;
    const deleteOne = deleteMutation;

    const handleCreateAlertHub = async (data: AlertHub) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success('Data imported successfully');
        } catch (error) {
            toast.error('Failed to import the data');
            throw error;
        }
    };

    const handleUpdateAlertHub = async (id: string, data: AlertHub) => {
        try {
            await updateOne.mutateAsync({ id, ...data });
            toast.success('updated successfully');
        } catch (error) {
            toast.error('Failed to update');
            throw error;
        }
    };

    const handleDeleteAlertHub = async (id: string) => {
        try {
            await deleteOne.mutateAsync({ id });
            toast.success('deleted successfully');
        } catch (error) {
            toast.error('Failed to delete');
            throw error;
        }
    };

    return {
        alertHub,
        isLoading,
        isFetching,
        isError,
        handleCreateAlertHub,
        handleUpdateAlertHub,
        handleDeleteAlertHub
    };
}

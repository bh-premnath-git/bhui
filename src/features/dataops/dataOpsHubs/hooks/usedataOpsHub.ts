import { useResource } from "@/hooks/api/useResource";
import { DataOpsHub } from "@/types/dataops/dataOpsHub";
import { toast } from "sonner";
import { AUDIT_PORT } from "@/config/platformenv";

interface UseDataOpsHubOptions {
  shouldFetch?: boolean;
}

export const useDataOpsHub = (options: UseDataOpsHubOptions = { shouldFetch: true }) => {
  const {
    getAll,
    createOne,
    updateOne,
    deleteOne
  } = useResource<DataOpsHub>('job_details', AUDIT_PORT, true);

  const { data: dataOpsHub, isLoading, isFetching, isError } = getAll('/job_details/list/');
  const createMutation = createOne();
  const updateMutation = updateOne("placeholder-id");
  const deleteMutation = deleteOne("placeholder-id");

  const handleCreateDataOpsHub = async (data: DataOpsHub) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Data imported successfully');
    } catch (error) {
      toast.error('Failed to import the data');
      throw error;
    }
  };

  const handleUpdateDataOpsHub = async (id: string, data: DataOpsHub) => {
    try {
      await updateMutation.mutateAsync({ id, ...data });
      toast.success('updated successfully');
    } catch (error) {
      toast.error('Failed to update');
      throw error;
    }
  };

  const handleDeleteDataOpsHub = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('deleted successfully');
    } catch (error) {
      toast.error('Failed to delete');
      throw error;
    }
  };

  return {
    dataOpsHub,
    isLoading,
    isFetching,
    isError,
    handleCreateDataOpsHub,
    handleUpdateDataOpsHub,
    handleDeleteDataOpsHub
  };
}


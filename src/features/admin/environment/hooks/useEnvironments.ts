import { useResource } from '@/hooks/api/useResource';
import { Environment, EnvironmentMutationData } from '@/types/admin/environment';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseEnvironmentsOptions {
  shouldFetch?: boolean;
  environmentId?: string;
}

export const useEnvironments = (options: UseEnvironmentsOptions = { shouldFetch: true }) => {
  const {
    getAll,
    getOne,
    createMutation,
    updateMutation,
    deleteMutation
  } = useResource<Environment>('environments', CATALOG_API_PORT, true);

  const { data: environments, isLoading, isFetching, isError } = getAll("/environment/environment/list/");

  const { 
    data: environment, 
    isLoading: isEnvironmentLoading, 
    isFetching: isEnvironmentFetching, 
    isError: isEnvironmentError 
  } = options.environmentId ? getOne(`/environment/environment/${options.environmentId}/`) : {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false
  };
  
  const handleCreateEnvironment = async (data: EnvironmentMutationData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Environment created successfully');
    } catch (error) {
      toast.error('Failed to create environment');
      throw error;
    }
  };

  const handleUpdateEnvironment = async (id: string, data: EnvironmentMutationData) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        url: `/environment/environment/${id}/`
      });
      toast.success('Environment updated successfully');
    } catch (error) {
      toast.error('Failed to update environment');
      throw error;
    }
  };

  const handleDeleteEnvironment = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({
        url: `/environment/environment/${id}/`
      });
      toast.success('Environment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete environment');
      throw error;
    }
  };

  return {
    environments,
    environment,
    isLoading,
    isEnvironmentLoading,
    isFetching,
    isEnvironmentFetching,
    isError,
    isEnvironmentError,
    handleCreateEnvironment,
    handleUpdateEnvironment,
    handleDeleteEnvironment
  };
};

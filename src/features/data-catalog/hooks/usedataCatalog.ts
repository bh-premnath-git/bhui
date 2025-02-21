import { useResource } from '@/hooks/api/useResource';
import { DataSourcePaginatedResponse, DataSourceMutationData } from '@/types/data-catalog/dataCatalog';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseDataCatalogOptions {
  shouldFetch?: boolean;
}

export const usedatasource =  (options: UseDataCatalogOptions = { shouldFetch: true })  => {
  const {
    getAll,
    createOne,
    updateOne,
    deleteOne
  } = useResource<DataSourcePaginatedResponse>('data_source', CATALOG_API_PORT, true);

  const { data: datasource, isLoading, isFetching, isError } = getAll('/data_source/list/');
  const createMutation = createOne();
  const updateMutation = updateOne("placeholder-id");
  const deleteMutation = deleteOne("placeholder-id");

  const handlecreateDatasource = async (data: DataSourceMutationData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Data imported successfully');
    } catch (error) {
      toast.error('Failed to import the data');
      throw error;
    }
  };

  const handleUpdateDatasource = async (id: string, data: DataSourceMutationData) => {
    try {
      await updateMutation.mutateAsync({ id, ...data });
      toast.success('updated successfully');
    } catch (error) {
      toast.error('Failed to update');
      throw error;
    }
  };

  const handleDeleteDatasource = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('deleted successfully');
    } catch (error) {
      toast.error('Failed to delete');
      throw error;
    }
  };
  
  

  return {
    datasource,
    isLoading,
    isFetching,
    isError,
    handlecreateDatasource,
    handleUpdateDatasource,
    handleDeleteDatasource
  };
};

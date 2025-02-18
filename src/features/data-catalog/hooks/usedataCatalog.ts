import { useResource } from '@/hooks/api/useResource';
import { DataSourcePaginatedResponse, DataSourceMutationData } from '@/types/data-catalog/dataCatalog';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

export const usedatasource = () => {
  const {
    getAll,
    // createOne,
    // updateOne,
    // deleteOne
  } = useResource<DataSourcePaginatedResponse>('data_source', CATALOG_API_PORT, true);

  const { data: data_source, isLoading, isFetching, isError } = getAll('/data_source/list/');
  console.log(data_source)
//   const createMutation = createOne();
//   const updateMutation = updateOne("placeholder-id");
//   const deleteMutation = deleteOne("placeholder-id");

//   const handleCreateProject = async (data: DataSourceMutationData) => {
//     try {
//       await createMutation.mutateAsync(data);
//       toast.success('Data imported successfully');
//     } catch (error) {
//       toast.error('Failed to import the data');
//       throw error;
//     }
//   };

//   const handleUpdateProject = async (id: string, data: DataSourceMutationData) => {
//     try {
//       await updateMutation.mutateAsync({ id, ...data });
//       toast.success('updated successfully');
//     } catch (error) {
//       toast.error('Failed to update');
//       throw error;
//     }
//   };

//   const handleDeleteProject = async (id: string) => {
//     try {
//       await deleteMutation.mutateAsync({ id });
//       toast.success('Project deleted successfully');
//     } catch (error) {
//       toast.error('Failed to delete project');
//       throw error;
//     }
//   };

  return {
    data_source,
    isLoading,
    isFetching,
    isError,
    // handleCreateProject,
    // handleUpdateProject,
    // handleDeleteProject
  };
};

import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { ApiConfig } from '@/lib/api/api-config';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { toast } from 'sonner';

interface DeleteDataSourceResponse {
  message: string;
  success: boolean;
}

export const useDeleteDataSource = () => {
  return useMutation<DeleteDataSourceResponse, Error, number>({
    mutationFn: async (dataSourceId: number) => {
      const config: ApiConfig = {
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/api/v1/data_source/${dataSourceId}`,
        method: 'DELETE',
        metadata: {
          successMessage: 'Data source deleted successfully',
          errorMessage: 'Failed to delete data source'
        }
      };

      return apiService.request<DeleteDataSourceResponse>(config).then((res) => res.data);
    },
    onSuccess: (data) => {
      toast.success('Data source deleted successfully');
    },
    onError: (error) => {
      console.error('Delete data source error:', error);
      toast.error('Failed to delete data source');
    }
  });
};
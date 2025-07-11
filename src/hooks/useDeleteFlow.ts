import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { ApiConfig } from '@/lib/api/api-config';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { toast } from 'sonner';

interface DeleteFlowResponse {
  message: string;
  success: boolean;
}

export const useDeleteFlow = () => {
  return useMutation<DeleteFlowResponse, Error, number>({
    mutationFn: async (flowId: number) => {
      const config: ApiConfig = {
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/api/v1/flow/${flowId}`,
        method: 'DELETE',
        metadata: {
          successMessage: 'Flow deleted successfully',
          errorMessage: 'Failed to delete flow'
        }
      };

      return apiService.request<DeleteFlowResponse>(config).then((res) => res.data);
    },
    onSuccess: (data) => {
      toast.success('Flow deleted successfully');
    },
    onError: (error) => {
      console.error('Delete flow error:', error);
      toast.error('Failed to delete flow');
    }
  });
};
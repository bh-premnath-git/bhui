import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { ApiConfig } from '@/lib/api/api-config';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { toast } from 'sonner';

interface DeleteFlowResponse {
  message: string;
  success: boolean;
}

const isValidFlowId = (flowId: number | null | undefined): flowId is number => {
  return typeof flowId === 'number' && flowId > 0;
};

export const useDeleteFlow = () => {
  return useMutation<DeleteFlowResponse, Error, number | null | undefined>({
    mutationFn: async (flowId: number | null | undefined) => {
      // Validate flowId before making API call
      if (!isValidFlowId(flowId)) {
        const error = new Error(`Invalid flowId provided for deletion: ${flowId}`);
        console.error('useDeleteFlow: Invalid or missing flowId', { flowId });
        toast.error('Cannot delete flow: Invalid flow ID');
        throw error;
      }
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
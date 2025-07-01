import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { ApiConfig } from '@/lib/api/api-config';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { toast } from 'sonner';

interface DeletePipelineResponse {
  message: string;
  success: boolean;
}

export const useDeletePipeline = () => {
  return useMutation<DeletePipelineResponse, Error, number>({
    mutationFn: async (pipelineId: number) => {
      const config: ApiConfig = {
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/api/v1/pipeline/${pipelineId}`,
        method: 'DELETE',
        metadata: {
          successMessage: 'Pipeline deleted successfully',
          errorMessage: 'Failed to delete pipeline'
        }
      };

      return apiService.request<DeletePipelineResponse>(config).then((res) => res.data);
    },
    onSuccess: (data) => {
      toast.success('Pipeline deleted successfully');
    },
    onError: (error) => {
      console.error('Delete pipeline error:', error);
      toast.error('Failed to delete pipeline');
    }
  });
};
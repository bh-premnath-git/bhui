import { useQuery } from '@tanstack/react-query';
import { CATALOG_REMOTE_API_URL, USE_SECURE } from '@/config/platformenv';
import { apiService } from '../api/api-service';

// Query keys for transformation output
export const transformationOutputKeys = {
    all: ['transformationOutput'] as const,
    detail: (pipelineName: string, transformationName: string) => 
        [...transformationOutputKeys.all, pipelineName, transformationName] as const,
};

interface TransformationOutputParams {
    pipelineName?: string;
    transformationName?: string;
    page?: number;
    pageSize?: number;
    enabled?: boolean;
}

export const useTransformationOutputQuery = ({
    pipelineName,
    transformationName,
    page = 1,
    pageSize = 50,
    enabled = true
}: TransformationOutputParams) => {
    return useQuery({
        queryKey: transformationOutputKeys.detail(pipelineName || '', transformationName || ''),
        queryFn: async () => {
            if (!pipelineName || !transformationName) {
                return null;
            }
            
            const response:any = await apiService.get({
                baseUrl:CATALOG_REMOTE_API_URL,
                url: '/pipeline/debug/get_transformation_output',
                usePrefix: true,
                params: {
                    pipeline_name: pipelineName,
                    transformation_name: transformationName,
                    page,
                    page_size: pageSize,
                    use_secure:USE_SECURE
                },
                method: 'GET'
            });

            if (response.error) {
                throw new Error(response.error);
            }

            return response.outputs;
        },
        // Only run the query when enabled is true and we have the required parameters
        enabled: enabled && Boolean(pipelineName) && Boolean(transformationName)
    });
};

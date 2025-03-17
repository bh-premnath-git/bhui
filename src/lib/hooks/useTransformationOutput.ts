import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { apiService } from '../api/api-service';

const apiClient = axios.create({
    baseURL: `http://localhost:${CATALOG_API_PORT}`
});

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
                portNumber: CATALOG_API_PORT,
                url: '/pipeline/debug/get_transformation_output',
                usePrefix: true,
                params: {
                    pipeline_name: pipelineName,
                    transformation_name: transformationName,
                    page,
                    page_size: pageSize,
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

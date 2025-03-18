import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CATALOG_API_PORT } from '@/config/platformenv';

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
    pipelineName: string;
    transformationName: string;
    page?: number;
    pageSize?: number;
}

export const useTransformationOutputQuery = ({
    pipelineName,
    transformationName,
    page = 1,
    pageSize = 50
}: TransformationOutputParams) => {
    return useQuery({
        queryKey: transformationOutputKeys.detail(pipelineName, transformationName),
        queryFn: async () => {
            const { data } = await apiClient.get('/pipeline/debug/get_transformation_output', {
                params: {
                    pipeline_name: pipelineName,
                    transformation_name: transformationName?.toLowerCase(),
                    page,
                    page_size: pageSize,
                }
            });

            if (data.error) {
                throw new Error(data.error);
            }

            return data.outputs;
        }
    });
};

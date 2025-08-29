import { useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import type {
    Pipeline,
    PipelinePaginatedResponse,
    PipelineMutationData
} from '@/types/designer/pipeline';
import { toast } from 'sonner';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface UsePipelineOptions {
    shouldFetch?: boolean;
    pipelineId?: string;
}

interface ApiErrorOptions {
    action: 'create' | 'update' | 'delete' | 'fetch';
    context?: string;
    silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
    const { action, context = 'pipeline', silent = false } = options;
    const errorMessage = `Failed to ${action} ${context}`;
    console.error(`${errorMessage}:`, error);
    if (!silent) {
        toast.error(errorMessage);
    }
    throw error;
};

export const usePipeline = (options: UsePipelineOptions = { shouldFetch: true }) => {
    // For queries
    const { getOne: getPipeline, getAll: getAllPipelines } = useResource<PipelinePaginatedResponse>(
        'pipelines',
        CATALOG_REMOTE_API_URL,
        true
    );
    // For mutations
    const { 
        create: createPipeline,
        update: updatePipeline,
        remove: removePipeline
    } = useResource<PipelineMutationData>(
        'pipelines',
        CATALOG_REMOTE_API_URL,
        true
    );

    // List pipelines with pagination
    const fetchPipelineList = (enabled = true) =>
        getAllPipelines({
            url: '/pipeline/list/',
            queryOptions: {
                enabled,
                retry: 2
            },
            params: { limit: 1000,order_desc:true }
        });

    // Fetch single pipeline by ID
    // const fetchPipelineById = (pipelineId: string, enabled = true) =>
    //     getPipeline({
    //         url: `/pipeline/${pipelineId}/`,
    //         queryOptions: {
    //             enabled,
    //             retry: 2
    //         }
    //     });

    // Create pipeline mutation
    const createPipelineMutation = createPipeline({
        url: '/pipeline/',
        mutationOptions: {
            onSuccess: () => toast.success('Pipeline created successfully'),
            onError: (error) => handleApiError(error, { action: 'create' }),
        },
    });

    // Update pipeline mutation
    const updatePipelineMutation = updatePipeline('/pipeline', {
        mutationOptions: {
            onSuccess: () => toast.success('Pipeline updated successfully'),
            onError: (error) => handleApiError(error, { action: 'update' }),
        },
    });

    // Delete pipeline mutation
    const deletePipelineMutation = removePipeline('/pipeline', {
        mutationOptions: {
            onSuccess: () => toast.success('Pipeline deleted successfully'),
            onError: (error) => handleApiError(error, { action: 'delete' }),
        },
    });

    // Type-safe mutation handlers
    const handleCreatePipeline = useCallback(async (data: PipelineMutationData) => {
        await createPipelineMutation.mutateAsync({
            data
        });
    }, [createPipelineMutation]);

    const handleUpdatePipeline = useCallback(async (id: string, data: PipelineMutationData) => {
        await updatePipelineMutation.mutateAsync({
            data,
            url: `/pipeline/${id}/`
        });
    }, [updatePipelineMutation]);

    const handleDeletePipeline = useCallback(async (id: string) => {
        await deletePipelineMutation.mutateAsync({
            params: { id }
        });
    }, [deletePipelineMutation]);

    // Get current pipeline list if shouldFetch is true
    const { data: pipelines, isLoading, isFetching, isError } = fetchPipelineList(options.shouldFetch);

    // Get single pipeline if ID is provided
    // const { 
    //     data: pipeline,
    //     isLoading: isPipelineLoading,
    //     isFetching: isPipelineFetching,
    //     isError: isPipelineError 
    // } = fetchPipelineById(options.pipelineId || '', options.shouldFetch && !!options.pipelineId);

    return {
        // Query results
        pipelines: pipelines || [],
        // pipeline: pipeline?.data?.[0] || null,
        isLoading,
        isFetching,
        isError,
        // isPipelineLoading,
        // isPipelineFetching,
        // isPipelineError,

        // Query functions
        fetchPipelineList,
        // fetchPipelineById,

        // Mutation handlers
        handleCreatePipeline,
        handleUpdatePipeline,
        handleDeletePipeline,
    };
};
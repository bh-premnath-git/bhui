import { useResource } from '@/hooks/api/useResource';
import type {
    PipelinePaginatedResponse,
    PipelineMutationData
} from '@/types/designer/pipeline';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UsePipelineOptions {
    shouldFetch?: boolean;
}

export const usePipeline = (options: UsePipelineOptions = { shouldFetch: true }) => {
    const {
        getAll,
        createOne,
        updateMutation,
        deleteMutation
    } = useResource<PipelinePaginatedResponse>('pipelines', CATALOG_API_PORT, true);

    const { data: pipelines, isLoading, isFetching, isError } = getAll('/pipeline/list/');
    const createMutation = createOne();

    const handleCreatePipeline = async (data: PipelineMutationData) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success('Pipeline created successfully');
        } catch (error) {
            toast.error('Failed to create pipeline');
            throw error;
        }
    };

    const handleUpdatePipeline = async (id: string, data: PipelineMutationData) => {
        try {
            await updateMutation.mutateAsync({ id, ...data });
            toast.success('Pipeline updated successfully');
        } catch (error) {
            toast.error('Failed to update pipeline');
            throw error;
        }
    };

    const handleDeletePipeline = async (id: string) => {
        try {
            await deleteMutation.mutateAsync({ id });
            toast.success('Pipeline deleted successfully');
        } catch (error) {
            toast.error('Failed to delete pipeline');
            throw error;
        }
    };

    return {
        pipelines,
        isLoading,
        isFetching,
        isError,
        handleCreatePipeline,
        handleUpdatePipeline,
        handleDeletePipeline
    };
};
import { useResource } from '@/hooks/api/useResource';
import type {
    FlowPaginatedResponse,
    FlowMutationData
} from '@/types/designer/flow';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseFlowOptions {
    shouldFetch?: boolean;  
}

export const useFlow = (options: UseFlowOptions = { shouldFetch: true }) => {
    const {
        getAll,
        createOne,
        updateOne,
        deleteOne
    } = useResource<FlowPaginatedResponse>('flows', CATALOG_API_PORT, true);

    const { data: flows, isLoading, isFetching, isError } = getAll('/flow/list/');
    const createMutation = createOne();
    const updateMutation = updateOne("placeholder-id");
    const deleteMutation = deleteOne("placeholder-id");

    const handleCreateFlow = async (data: FlowMutationData) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success('Flow created successfully');
        } catch (error) {
            toast.error('Failed to create flow');
            throw error;
        }
    };

    const handleUpdateFlow = async (id: string, data: FlowMutationData) => {
        try {
            await updateMutation.mutateAsync({ id, ...data });
            toast.success('Flow updated successfully');
        } catch (error) {
            toast.error('Failed to update flow');
            throw error;
        }
    };

    const handleDeleteFlow = async (id: string) => {
        try {
            await deleteMutation.mutateAsync({ id });
            toast.success('Flow deleted successfully');
        } catch (error) {
            toast.error('Failed to delete flow');
            throw error;
        }
    };

    return {
        flows,
        isLoading,
        isFetching,
        isError,
        handleCreateFlow,
        handleUpdateFlow,
        handleDeleteFlow
    };
}
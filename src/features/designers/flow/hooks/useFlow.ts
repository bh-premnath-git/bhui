import { useResource } from '@/hooks/api/useResource';
import type {
    Flow,
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
        createMutation,
        updateMutation,
        deleteMutation
    } = useResource<Flow>('flows', CATALOG_API_PORT, true);

    const { data: flowsResponse, isLoading, isFetching, isError, refetch } = getAll('/flow/list/') as {
        data: FlowPaginatedResponse;
        isLoading: boolean;
        isFetching: boolean;
        isError: boolean;
        refetch: () => Promise<any>;
    };

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
            await updateMutation.mutateAsync({
                ...data,
                url: `/flow/${id}/`
            });
            toast.success('Flow updated successfully');
        } catch (error) {
            toast.error('Failed to update flow');
            throw error;
        }
    };

    const handleDeleteFlow = async (id: string) => {
        try {
            await deleteMutation.mutateAsync({
                url: `/flow/${id}/`
            });
            toast.success('Flow deleted successfully');
        } catch (error) {
            toast.error('Failed to delete flow');
            throw error;
        }
    };

    return {
        flows: flowsResponse || [],
        isLoading,
        isFetching,
        isError,
        handleCreateFlow,
        handleUpdateFlow,
        handleDeleteFlow,
        refetchFlows: refetch
    };
};
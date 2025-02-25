import { useState, useEffect, useMemo } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import type {
    Flow,
    FlowPaginatedResponse,
    FlowMutationData
} from '@/types/designer/flow';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseFlowOptions {
    shouldFetch?: boolean;
    flowId?: string;
    mutationsOnly?: boolean;
}

interface ApiErrorOptions {
    action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
    context?: string;
    silent?: boolean;
}

interface ApiError extends Error {
    response?: {
        status: number;
        data?: {
            detail?: string;
        };
    };
}

const isFlowNotFoundError = (error: unknown): boolean => {
    const apiError = error as ApiError;
    return (
        apiError?.response?.status === 404 &&
        typeof apiError?.response?.data?.detail === 'string' &&
        apiError.response.data.detail.includes('Flow not found')
    );
};

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
    const { action, context = 'flow', silent = false } = options;
    const errorMessage = `Failed to ${action} ${context}`;
    console.error(`${errorMessage}:`, error);
    if (!silent) {
        toast.error(errorMessage);
    }
    throw error;
};

export const useFlow = (options: UseFlowOptions = { shouldFetch: true }) => {
    const {
        getAll,
        getOne,
        createMutation,
        updateMutation,
        deleteMutation
    } = useResource<Flow>('flows', CATALOG_API_PORT, true);

    const flowsQuery = !options.mutationsOnly ? getAll('/flow/list/') as {
        data: FlowPaginatedResponse;
        isLoading: boolean;
        isFetching: boolean;
        isError: boolean;
        refetch: () => Promise<any>;
    } : null;

    const flowQuery = options.flowId ? getOne(`/flow/${options.flowId || ''}/`, {
        enabled: !!options.flowId && options.shouldFetch
    }) : null;

    const { data: flowsResponse, isLoading, isFetching, isError, refetch } = flowsQuery || {};
    const {
        data: flow,
        isLoading: isFlowLoading,
        isFetching: isFlowFetching,
        isError: isFlowError
    } = flowQuery || {};

    const handleCreateFlow = async (data: FlowMutationData) => {
        try {
            await createMutation.mutateAsync({
                ...data,
                url: '/flow/create/'
            });
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
            handleApiError(error, { action: 'update' });
        }
    };

    const handleDeleteFlow = async (id: string) => {
        try {
            await deleteMutation.mutateAsync({
                url: `/flow/${id}/`
            });
            toast.success('Flow deleted successfully');
        } catch (error) {
            handleApiError(error, { action: 'delete' });
        }
    };

    return {
        flows: flowsResponse || [],
        flow,
        isLoading,
        isFlowLoading: isFlowLoading || false,
        isFetching,
        isFlowFetching: isFlowFetching || false,
        isError,
        isFlowError: isFlowError || false,
        handleCreateFlow,
        handleUpdateFlow,
        handleDeleteFlow,
        refetchFlows: refetch
    };
};

export const useFlowSearch = () => {
    const { getOne } = useResource<Flow[]>('flows', CATALOG_API_PORT, true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const { data: searchResults, isLoading, error } = getOne(`/flow/flow/search?flow_name=${searchQuery}`, { 
        enabled: !!searchQuery,
    });

    const flowFound = searchResults && searchResults.length > 0;
    const flowNotFound = searchResults && searchResults.length === 0;

    const debounceSearchFlow = useMemo(() =>
        debounce((query: string) => {
            setSearchQuery(query);
        }, 500),
        []
    );

    useEffect(() => {
        return () => debounceSearchFlow.cancel();
    }, [debounceSearchFlow]);

    return {
        searchedFlow: flowFound ? searchResults[0] : null,
        searchLoading: isLoading,
        flowFound,
        flowNotFound,
        debounceSearchFlow,
    };
};
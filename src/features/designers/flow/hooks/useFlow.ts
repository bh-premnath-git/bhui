import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import type {
  Flow,
  FlowMutationData,
} from '@/types/designer/flow';

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
  context?: string;
  silent?: boolean;
}

const isValidFlowId = (flowId: string | null | undefined): flowId is string => {
  return typeof flowId === 'string' && flowId.trim().length > 0;
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

const handleApiSuccess = (data: any, options: ApiErrorOptions) => {
  const { action, context = 'flow' } = options;
  const successMessage = `${context} ${action} successfully`;
};

export const useFlow = () => {
  // For queries - returns Flow objects
  const { getOne: getFlow, getAll: getAllFlows } = useResource<Flow>(
    'flows',
    CATALOG_REMOTE_API_URL,
    true
  );

  // For mutations - accepts FlowMutationData
  const { create: createFlow, update: updateFlow, remove: removeFlow } = useResource<FlowMutationData>(
    'flows',
    CATALOG_REMOTE_API_URL,
    true
  );

  // List flows with pagination
  const fetchFlowsList = (page = 1, pageSize = 10, enabled = true) =>
    getAllFlows({
      url: '/flow/list/',
      params: { page, limit: pageSize },
      queryOptions: {
        enabled,
        retry: 2
      },
    });

  // If you want to fetch a single flow by ID:
  const useFetchFlowById = (flowId: string | null | undefined, enabled = true) => {
    // Validate flowId before making API call
    if (!isValidFlowId(flowId)) {
      console.warn('useFetchFlowById: Invalid or missing flowId, skipping API call', { flowId });
      return getFlow({
        url: '/flow/invalid', // This will never be called due to enabled: false
        queryOptions: {
          enabled: false, // Disable the query
          retry: 0
        }
      });
    }

    return getFlow({
      url: `/flow/${flowId}`,
      queryOptions: {
        enabled: enabled && isValidFlowId(flowId),
        retry: 2
      }
    });
  };

  // Create Flow Mutation
  const createFlowMutation = createFlow({
    url: '/flow/create/',
    mutationOptions: {
      onSuccess: (data) => {
        toast.success('Flow created successfully');
        handleApiSuccess(data, { action: 'create' });
      },
      onError: (error) => handleApiError(error, { action: 'create' }),
    },
  });

  const handleCreateFlow = useCallback(async (data: FlowMutationData) => {
    try {
      const result = await createFlowMutation.mutateAsync({
        data
      });
      return result;
    } catch (error) {
      handleApiError(error, { action: 'create' });
      throw error;
    }
  }, [createFlowMutation]);

  // 2) "Update flow" mutation with dynamic URL
  const updateFlowMutation = updateFlow('/flow', {
    mutationOptions: {
      onSuccess: () => toast.success('Flow updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // 3) "Delete flow" mutation with dynamic URL
  const deleteFlowMutation = removeFlow('/flow', {
    mutationOptions: {
      onSuccess: () => toast.success('Flow deleted successfully'),
      onError: (error) => handleApiError(error, { action: 'delete' }),
    },
  });

  // Type-safe mutation handlers
  const handleUpdateFlow = useCallback(async (flowId: string | null | undefined, data: FlowMutationData) => {
    // Validate flowId before making API call
    if (!isValidFlowId(flowId)) {
      const error = new Error(`Invalid flowId provided for update: ${flowId}`);
      console.error('handleUpdateFlow: Invalid or missing flowId', { flowId });
      toast.error('Cannot update flow: Invalid flow ID');
      throw error;
    }

    try {
      await updateFlowMutation.mutateAsync({
        data,
        url: `/flow/${flowId}/`
      });
    } catch (error) {
      console.error('handleUpdateFlow: API call failed', { flowId, error });
      throw error;
    }
  }, [updateFlowMutation]);

  const handleDeleteFlow = useCallback(async (flowId: string | null | undefined) => {
    // Validate flowId before making API call
    if (!isValidFlowId(flowId)) {
      const error = new Error(`Invalid flowId provided for deletion: ${flowId}`);
      console.error('handleDeleteFlow: Invalid or missing flowId', { flowId });
      toast.error('Cannot delete flow: Invalid flow ID');
      throw error;
    }

    try {
      await deleteFlowMutation.mutateAsync({
        url: `/flow/${flowId}/`
      });
    } catch (error) {
      console.error('handleDeleteFlow: API call failed', { flowId, error });
      throw error;
    }
  }, [deleteFlowMutation]);

  return {
    fetchFlowsList,
    useFetchFlowById,
    createFlowMutation,
    handleCreateFlow,
    handleUpdateFlow,
    handleDeleteFlow,
  };
};

export const useFlowSearch = () => {
  const { getOne } = useResource<Flow[]>('flows', CATALOG_REMOTE_API_URL, true);
  const [searchQuery, setSearchQuery] = useState('');

  const searchFlow = (query: string, enabled = true) => {
    // Validate search query before making API call
    const isValidQuery = typeof query === 'string' && query.trim().length > 0;
    
    if (!isValidQuery && enabled) {
      console.warn('searchFlow: Invalid or empty search query, skipping API call', { query });
    }

    return getOne({
      url: '/flow/flow/search',
      params: { flow_name: query },
      queryOptions: {
        enabled: enabled && isValidQuery,
        retry: 2
      },
    });
  };

  const { data: searchResults, isLoading } = searchFlow(searchQuery, !!searchQuery && searchQuery.trim().length > 0);

  const flowFound = searchResults && searchResults.length > 0;
  const flowNotFound = searchResults && searchResults.length === 0;

  const debounceSearchFlow = useMemo(
    () =>
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
    searchFlow,
  };
};
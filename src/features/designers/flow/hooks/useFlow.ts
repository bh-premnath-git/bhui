import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import { CATALOG_API_PORT } from '@/config/platformenv';
import type {
  Flow,
  FlowMutationData,
} from '@/types/designer/flow';

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
  context?: string;
  silent?: boolean;
}

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
    CATALOG_API_PORT,
    true
  );

  // For mutations - accepts FlowMutationData
  const { create: createFlow, update: updateFlow, remove: removeFlow } = useResource<FlowMutationData>(
    'flows',
    CATALOG_API_PORT,
    true
  );

  // List flows with pagination
  const fetchFlowsList = (enabled = true) =>
    getAllFlows({
      url: '/flow/list/',
      params: {limit:1000},
      queryOptions: {
        enabled,
        retry: 2
      },
    });

  // If you want to fetch a single flow by ID:
  const useFetchFlowById = (flowId: string, enabled = true) =>
    getFlow({
      url: `/flow/${flowId}/`,
      queryOptions: {
        enabled,
        retry: 2
      }
    });

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
  const handleUpdateFlow = useCallback(async (flowId: string, data: FlowMutationData) => {
    await updateFlowMutation.mutateAsync({
      data,
      url: `/flow/${flowId}/`
    });
  }, [updateFlowMutation]);

  const handleDeleteFlow = useCallback(async (flowId: string) => {
    await deleteFlowMutation.mutateAsync({
      params: { flowId }
    });
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
  const { getOne } = useResource<Flow[]>('flows', CATALOG_API_PORT, true);
  const [searchQuery, setSearchQuery] = useState('');

  const searchFlow = (query: string, enabled = true) =>
    getOne({
      url: '/flow/flow/search',
      params: { flow_name: query },
      queryOptions: {
        enabled,
        retry: 2
      },
    });

  const { data: searchResults, isLoading } = searchFlow(searchQuery, !!searchQuery);

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
import { useCallback, useMemo } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import {
  LLM,
  LLMMutationCreate,
  LLMMutationUpdate,
  LLMPaginatedResponse,
} from '@/types/admin/llm';
import { toast } from 'sonner';

interface UseLlmsOptions {
  shouldFetch?: boolean;
  llmId?: string;
  limit?: number;
  offset?: number;
}

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'fetch';
  context?: string;
  silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions): unknown => {
  const { action, context = 'llm' } = options;
  const errorMessage = `Failed to ${action} ${context}`;
  console.error(`${errorMessage}:`, error);
  return error;
};

export const useLlms = (options: UseLlmsOptions = { shouldFetch: true }) => {
  const { getOne: getLlm, getAll: getAllLlms } = useResource<LLM>(
    '/bh_llms/llm_config',
    CATALOG_REMOTE_API_URL,
    true
  );

  const {
    create: createLlm,
    update: updateLlm,
    remove: removeLlm,
  } = useResource<LLMMutationCreate | LLMMutationUpdate>(
    '/bh_llms/llm_config',
    CATALOG_REMOTE_API_URL,
    true
  );

  const queryParams = useMemo(
    () => ({
      limit: options.limit ?? 10,
      offset: options.offset ?? 0,
    }),
    [options.limit, options.offset]
  );

  // Fetch All LLMs
  const {
    data: llmResponse,
    isLoading,
    isFetching,
    isError,
    refetch
  } = getAllLlms<LLMPaginatedResponse>({
    url: '/bh_llms/llm_config/list/',
    queryOptions: {
      enabled: options.shouldFetch,
      retry: 2,
    },
    params: queryParams,
  });

  // Fetch Single LLM
  const {
    data: llm,
    isLoading: isLlmLoading,
    isFetching: isLlmFetching,
    isError: isLlmError,
  } = options.llmId
    ? getLlm({
        url: `/bh_llms/llm_config/${options.llmId}`,
        queryOptions: {
          enabled: !!options.llmId,
          retry: 2,
        },
      })
    : {
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: false,
      };

  // Create Mutation
  const createLlmMutation = createLlm({
    url: '/bh_llms/llm_config/',
    mutationOptions: {
      onSuccess: () => toast.success('Llm created successfully'),
      onError: (error) => handleApiError(error, { action: 'create', context: 'llm'}),
    },
  });

  // Update Mutation
  const updateLlmMutation = updateLlm('/bh_llms/llm_config/', {
    mutationOptions: {
      onSuccess: () => toast.success('Llm Updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update', context: 'llm'}),
    },
  });

  // Delete Mutation
  const deleteLlmMutation = removeLlm('/bh_llms/llm_config/', {
    mutationOptions: {
      onSuccess: () => toast.success('Llm Deleted successfully'),
      onError: (error) => handleApiError(error, { action: 'delete', context: 'llm'}),
    },
  });

  // Handlers
  const handleCreateLlm = useCallback(
    async (data: LLMMutationCreate): Promise<void> => {
      await createLlmMutation.mutateAsync({ data });
    },
    [createLlmMutation]
  );

  const handleUpdateLlm = useCallback(
    async (id: string, data: LLMMutationUpdate): Promise<void> => {
      await updateLlmMutation.mutateAsync({
      url: `/bh_llms/llm_config/${id}`, 
        data,
      });
    },
    [updateLlmMutation]
  );
  const handleDeleteLlm = useCallback(
    async (id: string): Promise<void> => {
      await deleteLlmMutation.mutateAsync({
         url: `/bh_llms/llm_config/${id}`, 
      });
    },
    [deleteLlmMutation]
  );

  // Derived Values
  const llms = llmResponse?.data ?? [];
  const total = llmResponse?.total ?? 0;
  const offset = llmResponse?.offset ?? 0;
  const limit = llmResponse?.limit ?? 0;
  const prev = llmResponse?.prev ?? false;
  const next = llmResponse?.next ?? false;

  return {
    llms,
    llm,
    isLoading,
    isLlmLoading,
    isFetching,
    isLlmFetching,
    isError,
    isLlmError,
    total,
    offset,
    limit,
    prev,
    next,
    handleCreateLlm,
    handleUpdateLlm,
    handleDeleteLlm,
    refetch
  } as const;
};
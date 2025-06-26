import { useCallback, useMemo } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { Prompt, PromptPaginatedResponse } from '@/types/admin/prompt';
import { toast } from 'sonner';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface UsePromptsOptions {
    shouldFetch?: boolean;
    promptId?: string;
    limit?: number;
    offset?: number;
}

interface UsePromptModuleOptions {
    shouldFetch?: boolean;
    promptModuleId?: string;
}

interface ApiErrorOptions {
    action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
    context?: string;
    silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
    const { action, context = 'prompt', silent = false } = options; 
    const errorMessage = `Failed to ${action} ${context}`;
    console.error(`${errorMessage}:`, error)
    if (!silent) {
        toast.error(errorMessage)
    }           
    throw error;
};  

export const usePrompts = (options: UsePromptsOptions = { shouldFetch: true }) => {
    const { getOne: getPrompt, getAll: getAllPrompt } = useResource<Prompt>(
        '/prompt/prompt',
        CATALOG_REMOTE_API_URL,
        true
    );

    const { create: createPrompt, update: updatePrompt, remove: removePrompt } = useResource<Prompt>(
            '/prompt/prompt/',
            CATALOG_REMOTE_API_URL,
            true
    );

    const queryParams = useMemo(() => ({
        limit: options.limit ?? 10,
        offset: options.offset ?? 0,
    }), [options.limit, options.offset]);

    const { data: promptPaginatedResponse, isLoading, isFetching, isError, refetch } = getAllPrompt<PromptPaginatedResponse>({
            url: '/prompt/prompt/list/',
            queryOptions: {
                enabled: options.shouldFetch,
                retry: 2
            },
            params: queryParams
        });
    
    const prompts = promptPaginatedResponse?.data || [];
    const total = promptPaginatedResponse?.total || 0;
    const offset = promptPaginatedResponse?.offset || 0;
    const limit = promptPaginatedResponse?.limit || 0;
    const prev = promptPaginatedResponse?.prev || false;
    const next = promptPaginatedResponse?.next || false;

    const {
        data: promptResponse,
        isLoading: isPromptLoading,
        isFetching: isPromptFetching,
        isError: isPromptError,
    } = options.promptId ? getPrompt({
        url: `/prompt/prompt/${options.promptId}`,
        queryOptions: {
            enabled: !!options.promptId,
            retry: 2,
            retryDelay: 1000,
        }
    }) : {
            data: undefined,
            isLoading: false,
            isFetching: false,
            isError: false
        };
    
    const createPromptMutation = createPrompt({
        url: '/prompt/prompt/',
        mutationOptions: {
            onSuccess: () => toast.success('Prompt created successfully'),
            onError: (error) => handleApiError(error, { action: 'create', context: 'prompt' })
        },
    });

    const updatePromptMutation = updatePrompt('/prompt/prompt/', {
        mutationOptions: {
            onSuccess: () => toast.success('Prompt Updated successfully'),
            onError: (error) => handleApiError(error, { action: 'update', context: 'prompt' })
        },
    });

    const deletePromptMutation = removePrompt('/prompt/prompt/', {
        mutationOptions: {
            onSuccess: () => toast.success('Prompt Deleted Successfully'),
            onError: (error) => handleApiError(error, { action: 'delete', context: 'prompt' })
        },
    });

    const handleCreatePrompt = useCallback(async (data: Prompt) => {
        await createPromptMutation.mutateAsync({
            data
        });
    }, [createPromptMutation]);

    const handleUpdatePrompt = useCallback(async (id: string, data: Prompt) => {
        await updatePromptMutation.mutateAsync({
            data,
            url: `/prompt/prompt/${id}/`
        });
    }, [updatePromptMutation]);

    const handleDeletePrompt = useCallback(async (id: string) => {
        await deletePromptMutation.mutateAsync({
            url: `/prompt/prompt/${id}/`
        });
    }, [deletePromptMutation]);


    return {
        prompts, 
        total,
        offset,
        limit,
        prev,
        next,
        isLoading,
        isFetching,
        isError,
        refetch,
        handleCreatePrompt,
        handleUpdatePrompt,
        handleDeletePrompt,
        promptResponse,
        isPromptLoading,
        isPromptFetching,
        isPromptError
    };
};
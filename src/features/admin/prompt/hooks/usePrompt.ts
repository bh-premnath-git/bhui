import { useState, useEffect, useMemo, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce, remove, update } from 'lodash';
import { Prompt, PromptModule } from '@/types/admin/prompt';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UsePromptsOptions {
    shouldFetch?: boolean;
    promptId?: string;
}

interface UsePromptModuleOptions {
    shouldFetch?: boolean;
    promptModuleId?: string;
}

interface ApiErrorOptions {
    action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
    context?: string;
    slient?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
    const { action, context = 'prompt', slient = false } = options; 
    const errorMessage = `Failed to ${action} ${context}`;
    console.error(`${errorMessage}:`, error)
    if (!slient) {
        toast.error(errorMessage)
    }           
    throw error;
};  

export const usePrompts = (options: UsePromptsOptions = { shouldFetch: true }) => {
    const { getOne: getPrompt, getAll: getAllPrompt } = useResource<Prompt>(
        '/prompt/prompt',
        CATALOG_API_PORT,
        true
    );

    const { create: createPrompt, update: updatePrompt, remove: removePrompt } = useResource<Prompt>(
            '/prompt/prompt/',
            CATALOG_API_PORT,
            true
    );

    const { data: PromptResponse, isLoading, isFetching, isError, refetch } = getAllPrompt({
            url: '/prompt/prompt/list/',
            queryOptions: {
                enabled: options.shouldFetch,
                retry: 2
            },
            params: { limit: 1000 }
        }) as {
            data: Prompt[];
            isLoading: boolean;
            isFetching: boolean;
            isError: boolean;
            refetch: () => void;
        };
    
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
            onSuccess: () => toast.success('prompt Deleted Successfully'),
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

    const handleDeleteConnection = useCallback(async (id: string) => {
        await deletePromptMutation.mutateAsync({
            url: `/prompt/prompt/${id}/`
        });
    }, [deletePromptMutation]);


    return {
        prompt: PromptResponse, 
        isLoading,
        isFetching,
        isError,
        refetch,
        handleCreatePrompt,
        handleUpdatePrompt,
        handleDeleteConnection,
        PromptResponse,
        isPromptLoading,
        isPromptFetching,
        isPromptError
    };
};
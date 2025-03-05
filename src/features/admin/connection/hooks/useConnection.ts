import { useState, useEffect, useMemo, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import { Connection, ConnectionType, ConnectionValue } from '@/types/admin/connection';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseConnectionsOptions {
    shouldFetch?: boolean;
    connectionId?: string;
}

interface UseConnectionTypeOptions {
    shouldFetch?: boolean;
    connectionTypeId?: string;
}

interface ApiErrorOptions {
    action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
    context?: string;
    slient?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
    const { action, context = 'connection', slient = false } = options;
    const errorMessage = `Failed to ${action} ${context}`;
    console.error(`${errorMessage}:`, error)
    if (!slient) {
        toast.error(errorMessage)
    }
    throw error;
};

export const useConnections = (options: UseConnectionsOptions = { shouldFetch: true }) => {
    const { getOne: getConnection, getAll: getAllConnection } = useResource<Connection>(
        '/connection_registry/connection_config',
        CATALOG_API_PORT,
        true
    );

    const { create: createConnection, update: updateConnection, remove: removeConnection } = useResource<ConnectionValue>(
        '/connection_registry/connection_config',
        CATALOG_API_PORT,
        true
    );

    const { data: connectionResponse, isLoading, isFetching, isError, refetch } = getAllConnection({
        url: '/connection_registry/connection_config/list/',
        queryOptions: {
            enabled: options.shouldFetch,
            retry: 2
        },
        params: { limit: 1000 }
    }) as {
        data: Connection[];
        isLoading: boolean;
        isFetching: boolean;
        isError: boolean;
        refetch: () => void;
    };

    const {
        data: connnectionResponses,
        isLoading: isConnectionLoading,
        isFetching: isConnectionFetching,
        isError: isConnectionError
    } = options.connectionId ? getConnection({
        url: `/connection_registry/connection_config/${options.connectionId}/`,
        queryOptions: {
            enabled: !!options.connectionId,
            retry: 2
        }
    }) : {
            data: undefined,
            isLoading: false,
            isFetching: false,
            isError: false
        };

    const createConnectionMutation = createConnection({
        url: '/connection_registry/connection_config/',
        mutationOptions: {
            onSuccess: () => toast.success('Connection created successfully'),
            onError: (error) => handleApiError(error, { action: 'create', context: 'connection' })
        },
    });

    const updateCOnnectionMutation = updateConnection('/connection_registry/connection_config/', {
        mutationOptions: {
            onSuccess: () => toast.success('Connection Updated successfully'),
            onError: (error) => handleApiError(error, { action: 'update', context: 'connection' })
        },
    });

    const deleteConnectionMutation = removeConnection('/connection_registry/connection_config/', {
        mutationOptions: {
            onSuccess: () => toast.success('Connection Deleted Successfully'),
            onError: (error) => handleApiError(error, { action: 'delete', context: 'connection' })
        },
    });

    const handleCreateConnection = useCallback(async (data: ConnectionValue) => {
        await createConnectionMutation.mutateAsync({
            data
        });
    }, [createConnectionMutation]);

    const handleUpdateConnection = useCallback(async (id: string, data: ConnectionValue) => {
        await updateCOnnectionMutation.mutateAsync({
            data,
            params: { id }
        });
    }, [updateCOnnectionMutation]);

    const handleDeleteConnection = useCallback(async (id: string) => {
        await deleteConnectionMutation.mutateAsync({
            url: `/connection_registry/connection_config/${id}`
        });
    }, [deleteConnectionMutation]);

    return {
        connections: connectionResponse || [],
        isLoading,
        isFetching,
        isError,
        connnectionResponses,
        isConnectionLoading,
        isConnectionFetching,
        isConnectionError,
        handleCreateConnection,
        handleUpdateConnection,
        handleDeleteConnection,
        refetch
    };
}

export function useConnectionSearch() {
    const { getOne: searchConnection } = useResource<Connection[]>(
        '/connection_registry/connection_config',
        CATALOG_API_PORT,
        true
    );

    const [searchQuery, setSearchQuery] = useState('');

    const { data: searchResults, isLoading, error } = searchConnection({
        url: '/connection_registry/connection_config/search',
        params: { connection_name: searchQuery },
        queryOptions: {
            enabled: !!searchQuery,
            retry: 2
        }
    });

    const connectionFound = searchResults && searchResults.length > 0;
    const connectionNotFound = searchResults && searchResults.length === 0;

    const debounceSearchConnection = useMemo(
        () => debounce((query: string) => setSearchQuery(query), 800),
        []
    );
    useEffect(() => {
        return () => debounceSearchConnection.cancel();
    }, [debounceSearchConnection]);

    return {
        searchedConnection: connectionFound ? searchResults[0] : null,
        connectionFound,
        connectionNotFound,
        isLoading,
        error,
        debounceSearchConnection,
    };
}

export const useConnectionType = (options: UseConnectionTypeOptions = { shouldFetch: true }) => {
    const { getOne: getConnectionType, getAll: getAllConnectionType } = useResource<ConnectionType>(
        '/connection_registry/',
        CATALOG_API_PORT,
        true
    );
    const { data: connectionTypes, isLoading, isFetching, isError } = getAllConnectionType({
        url: '/connection_registry/list/',
        queryOptions: {
            enabled: options.shouldFetch,
            retry: 2
        },
        params: { limit: 1000 }
    });
    const {
        data: ConnectionType,
        isLoading: isEnvironmentLoading,
        isFetching: isEnvironmentFetching,
        isError: isEnvironmentError
    } = options.connectionTypeId ? getConnectionType({
        url: `/connection_registry/${options.connectionTypeId}/`,
        queryOptions: {
            enabled: !!options.connectionTypeId,
            retry: 2
        }
    }) : {
            data: undefined,
            isLoading: false,
            isFetching: false,
            isError: false
        };

    return {
        connectionTypes: Array.isArray(connectionTypes) ? connectionTypes : 
                        ConnectionType ? [ConnectionType] : [],
        isLoading,
        isFetching,
        isError,
        isEnvironmentLoading,
        isEnvironmentFetching,
        isEnvironmentError
    };
}
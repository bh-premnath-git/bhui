import { useState, useMemo, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import { Connection, ConnectionType, ConnectionValue, ConnectionPaginatedResponse } from '@/types/admin/connection';
import { Environment, EnvironmentListResponse } from '@/types/admin/environment';
import { toast } from 'sonner';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface UseConnectionsOptions {
    shouldFetch?: boolean;
    connectionId?: string;
    limit?: number;
    offset?: number;
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
        CATALOG_REMOTE_API_URL,
        true
    );

    const { create: createConnection, update: updateConnection, remove: removeConnection } = useResource<ConnectionValue>(
        '/connection_registry/connection_config',
        CATALOG_REMOTE_API_URL,
        true
    );

    const queryParams = useMemo(() => ({
        limit: options.limit ?? 10,
        offset: options.offset ?? 0,
      }), [options.limit, options.offset]);

    const { data: connectionResponse, isLoading, isFetching, isError, refetch } = getAllConnection<ConnectionPaginatedResponse>({
        url: '/connection_registry/connection_config/list/',
        queryOptions: {
            enabled: options.shouldFetch,
            retry: 2
        },
        params: queryParams
    });

    const connections = connectionResponse?.data || [];
    const total = connectionResponse?.total || 0;
    const offset = connectionResponse?.offset || 0;
    const limit = connectionResponse?.limit || 0;
    const prev = connectionResponse?.prev || false;
    const next = connectionResponse?.next || false;

    const { data: connnectionResponses, isLoading: isConnectionLoading, isFetching: isConnectionFetching, isError: isConnectionError } = options.connectionId ? getConnection({
        url: `/connection_registry/connection_config/${options.connectionId}`,
        queryOptions: {
            enabled: !!options.connectionId,
            retry: 2,
            retryDelay: 1000,
        }
    }) : {
            data: undefined,
            isLoading: false,
            isFetching: false,
            isError: false
        };

    const createConnectionMutation = createConnection({
        url: '/connection_registry/connection_config',
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
        connections,
        isLoading,
        isFetching,
        isError,
        total,
        offset,
        limit,
        prev,
        next,
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
    const { connections } = useConnections({ shouldFetch: true });
    const [searchQuery, setSearchQuery] = useState('');

    const connectionFound =
        !!searchQuery &&
        connections.some(
            (conn) =>
                conn.connection_config_name?.toLowerCase().trim() === searchQuery.toLowerCase().trim()
        );
    const connectionNotFound =
        !!searchQuery &&
        !connections.some(
            (conn) =>
                conn.connection_config_name?.toLowerCase().trim() === searchQuery.toLowerCase().trim()
        );
    const debounceSearchConnection = useMemo(
        () => debounce((query: string) => setSearchQuery(query), 800),
        []
    );
    return {
        searchedConnection: connectionFound
            ? connections.find(
                  (conn) =>
                      conn.connection_config_name?.toLowerCase().trim() === searchQuery.toLowerCase().trim()
              )
            : null,
        connectionFound,
        connectionNotFound,
        isLoading: false,
        error: null,
        debounceSearchConnection,
    };
}

export const useConnectionType = (options: UseConnectionTypeOptions = { shouldFetch: true }) => {
    const { getOne: getConnectionType, getAll: getAllConnectionType } = useResource<ConnectionType>(
        '/connection_registry/',
        CATALOG_REMOTE_API_URL,
        true
    );
    
    const { 
        data: connectionTypesResponse, 
        isLoading, 
        isFetching, 
        isError,
        refetch 
    } = getAllConnectionType({
        url: '/connection_registry/list/',
        queryOptions: {
            enabled: options.shouldFetch,
            retry: 2
        },
        params: { limit: 1000 }
    }) as {
        data: ConnectionType;
        isLoading: boolean;
        isFetching: boolean;
        isError: boolean;
        refetch: () => void;
    };

    const {
        data: singleConnectionTypeResponse,
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
        connectionTypes: connectionTypesResponse?.data || [],
        singleConnectionType: singleConnectionTypeResponse?.data || null,
        isLoading,
        isFetching,
        isError,
        isEnvironmentLoading,
        isEnvironmentFetching,
        isEnvironmentError,
        refetch
    };
}

export const useEnvironments = (options: { shouldFetch?: boolean } = { shouldFetch: true }) => {
    const { getAll: getAllEnvironments } = useResource<Environment>(
        '/environment/environment',
        CATALOG_REMOTE_API_URL,
        true
    );
    
    const { 
        data: environmentsResponse, 
        isLoading, 
        isFetching, 
        isError,
        refetch 
    } = getAllEnvironments<EnvironmentListResponse>({
        url: '/environment/environment/list/',
        queryOptions: {
            enabled: options.shouldFetch,
            retry: 2
        },
        params: { limit: 10, offset: 0 }
    });

    return {
        environments: environmentsResponse?.data || [],
        total: environmentsResponse?.total || 0,
        isLoading,
        isFetching,
        isError,
        refetch
    };
}
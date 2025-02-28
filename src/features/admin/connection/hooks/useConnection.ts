import { useState, useEffect, useMemo, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import { Connection, ConnectionType } from '@/types/admin/connection';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseConnectionsOptions{
    shouldFetch?: boolean;
    connectionId?: string;
}

interface UseConnectionTypeOptions{
    shouildFetch?: boolean;
    connectionTypeId?: string;
}

interface ApiErrorOptions{
    action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
    context?: string;
    slient?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
    const { action, context = 'connection', slient= false} = options;
    const errorMessage = `Failed to ${action} ${context}`;
    console.error(`${errorMessage}:`, error)
    if(!slient){
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

    const { data: connectionResponse, isLoading, isFetching, isError } = getAllConnection({
        url: '/connection_registry/connection_config/list/',
        queryOptions:{
           enabled: options.shouldFetch,
           retry:2 
        },
        params: {limit:1000}
    }) as {
        data: Connection;
        isLoading: boolean;
        isFetching: boolean;
        isError: boolean;
    }; 

    return{
        connections: connectionResponse || [],
        isLoading,
        isFetching,
        isError
    };
};

export function useConnectionSearch() {
    const { getOne: searchConnection } = useResource<Connection[]>(
        '/connection_registry/connection_config',
        CATALOG_API_PORT,
        true
    );

    const [ searchQuery, setSearchQuery ] = useState('');

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
    useEffect (() => {
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

export const useConnectionType = (options: UseConnectionTypeOptions = { shouildFetch: true }) => {
    const { getOne: getConnectionType, getAll: getAllConnectionType } = useResource<ConnectionType>(
        '/connection_registry/',
        CATALOG_API_PORT,
        true
    );
    const { data: connectionType, isLoading, isFetching, isError } = getAllConnectionType({})
}
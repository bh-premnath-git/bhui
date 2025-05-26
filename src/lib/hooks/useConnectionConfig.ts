import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

const apiClient = axios.create({
    baseURL: CATALOG_REMOTE_API_URL
});

// Query keys for connection config
export const connectionConfigKeys = {
    all: ['connectionConfig'] as const,
    list: () => [...connectionConfigKeys.all, 'list'] as const,
    detail: (id: string) => [...connectionConfigKeys.all, id] as const,
};

interface ConnectionConfigParams {
    id: string;
    offset?: number;
    limit?: number;
    orderDesc?: boolean;
}

interface ConnectionConfigResponse {
    // Define your response type here
    data: any;
}

export const useConnectionConfigQuery = (
    params: ConnectionConfigParams,
    options?: Omit<UseQueryOptions<ConnectionConfigResponse, Error>, 'queryKey' | 'queryFn'>
) => {
    const { id, offset = 0, limit = 10, orderDesc = false } = params;

    return useQuery<ConnectionConfigResponse, Error>({
        queryKey: connectionConfigKeys.detail(id),
        queryFn: async () => {
            const { data } = await apiClient.get('/connection_registry/connection_config/list/', {
                params: { id, offset, limit, order_desc: orderDesc },
                headers: { accept: 'application/json' }
            });
            return data;
        },
        ...options
    });
};

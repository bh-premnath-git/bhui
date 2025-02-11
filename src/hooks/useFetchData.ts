import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ApiService } from '@/services/api.services';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

interface QueryMetadata extends Record<string, unknown> {
  errorMessage?: string;
  successMessage?: string;
}

interface FetchDataParams {
  portNumber: string;
  url: string;
  params?: any;
  additionalHeaders?: Record<string, string>;
  usePrefix?: boolean;
  metadata?: QueryMetadata;
  enabled?: boolean;
}

interface ExtendedUseQueryOptions<TQueryFnData, TError, TData, TQueryKey extends readonly unknown[]>
  extends Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'meta'> {
  meta?: QueryMetadata;
  onError?: (error: TError) => void;
  onSuccess?: (data: TData) => void;
}

const useFetchData = <TData = any, TQueryKey extends readonly unknown[] = readonly unknown[]>(
  queryKey: TQueryKey,
  {
    portNumber,
    url,
    params,
    additionalHeaders,
    usePrefix = true,
    metadata,
    enabled = true,
  }: FetchDataParams
) => {  
  const options: ExtendedUseQueryOptions<TData, AxiosError<ApiError>, TData, TQueryKey> = {
    queryKey,
    queryFn: () =>
      ApiService<TData>({
        portNumber,
        method: 'get',
        url,
        data:null,
        params,
        additionalHeaders,
        usePrefix,
      }),
    enabled,
    meta: metadata,
  };

  return useQuery<TData, AxiosError<ApiError>, TData, TQueryKey>(options);
};

export { useFetchData };
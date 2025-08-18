import { apiService, MutationVariables } from '@/lib/api/api-service';
import type { ApiConfig } from '@/lib/api/api-config';
import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Helper type to wrap UseMutationOptions so it matches the shape
 * we want in mutateAsync(variables).
 */
type ResourceMutationOptions<T> = Omit<
  UseMutationOptions<T, Error, MutationVariables<T>>,
  'mutationFn'
>;

export function useResource<T>(resource: string, baseUrl: string, usePrefix: boolean) {
  const baseConfig: Partial<ApiConfig> = {
    baseUrl,
    usePrefix,
  };

  /**
   * ================  GET ALL  ================
   */
  const getAll = <TQueryFnData = T[], TData = TQueryFnData>(options?: {
    url?: string;
    params?: Record<string, any>;
    query?: string;
    queryOptions?: Omit<UseQueryOptions<TQueryFnData, Error, TData>, 'queryKey' | 'queryFn'>;
    
  }) => {
    const { url, params, query, queryOptions } = options || {};
    const queryKey = [resource, 'list', JSON.stringify({ params, query })];
    const queryConfig: ApiConfig = {
      ...baseConfig,
      url: url || `/${resource}`,
      method: 'GET',
      params,
      query,
      metadata: {
        errorMessage: `Failed to fetch ${resource} list`,
      },
    };
    return apiService.useApiQuery<TQueryFnData, Error, TData>(queryKey, queryConfig, queryOptions);
  };

  /**
   * ================  GET ONE  ================
   */
  const getOne = <TQueryFnData = T, TData = TQueryFnData>(options?: {
    id?: string | number;
    url?: string;
    params?: Record<string, any>;
    query?: string;
    queryOptions?: Omit<UseQueryOptions<TQueryFnData, Error, TData>, 'queryKey' | 'queryFn'>;
  }) => {
    const {id,  url, params, query, queryOptions } = options || {};
    const queryKey = [resource, 'one', id, JSON.stringify({ params, query })]
      .filter(item => item !== undefined && item !== null)
      .map(String);
    const queryConfig: ApiConfig = {
      ...baseConfig,
      url: url || `/${resource}`,
      method: 'GET',
      params,
      query,
      metadata: {
        errorMessage: `Failed to fetch ${resource}`,
      },
    };
    return apiService.useApiQuery<TQueryFnData, Error, TData>(queryKey, queryConfig, queryOptions);
  };

  /**
   * ================  CREATE  ================
   */
  const create = (options?: {
    url?: string;
    mutationOptions?: ResourceMutationOptions<T>;
  }) => {
    const { url, mutationOptions } = options || {};
    const config: ApiConfig = {
      ...baseConfig,
      url: url || `/${resource}`,
      method: 'POST',
      metadata: {
        successMessage: `${resource} created successfully`,
        errorMessage: `Failed to create ${resource}`,
      },
    };
    return apiService.useApiMutation<T, MutationVariables<T>>(config, mutationOptions);
  };

  /**
   * ================  UPDATE  ================
   */
  const update = (
    url?: string,
    options?: {
      params?: Record<string, any>;
      query?: string;
      mutationOptions?: ResourceMutationOptions<T>;
    }
  ) => {
    const { params, query, mutationOptions } = options || {};
    const config: ApiConfig = {
      ...baseConfig,
      url,
      method: 'PUT',
      params,
      query,
      metadata: {
        successMessage: `${resource} updated successfully`,
        errorMessage: `Failed to update ${resource}`,
      },
    };
    return apiService.useApiMutation<T, MutationVariables<T>>(config, mutationOptions);
  };

  /**
   * ================  PATCH  ================
   */
  const patch = (
    url: string,
    options?: {
      params?: Record<string, any>;
      query?: string;
      mutationOptions?: ResourceMutationOptions<T>;
    }
  ) => {
    const { params, query, mutationOptions } = options || {};
    const config: ApiConfig = {
      ...baseConfig,
      url,
      method: 'PATCH',
      params,
      query,
      metadata: {
        successMessage: `${resource} patched successfully`,
        errorMessage: `Failed to patch ${resource}`,
      },
    };
    return apiService.useApiMutation<T, MutationVariables<T>>(config, mutationOptions);
  };

  /**
   * ================  REMOVE  ================
   */
  const remove = (
    baseUrl: string,
    options?: {
      params?: Record<string, any>;
      query?: string;
      mutationOptions?: Omit<UseMutationOptions<void, Error, MutationVariables>, 'mutationFn'>;
    }
  ) => {
    const { params, query, mutationOptions } = options || {};
    const config: ApiConfig = {
      ...baseConfig,
      url: baseUrl,
      method: 'DELETE',
      params,
      query,
      metadata: {
        successMessage: `${resource} deleted successfully`,
        errorMessage: `Failed to delete ${resource}`,
      },
    };
    return apiService.useApiMutation<void, MutationVariables>(config, mutationOptions);
  };

  return {
    getAll,
    getOne,
    create,
    update,
    patch,
    remove,
  };
}

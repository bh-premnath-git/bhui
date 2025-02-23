import { useApiQuery, useApiMutation } from './useApiQuery';

export function useResource<T>(resource: string, portNumber: number, usePrefix: boolean) {
  const baseConfig = {
    portNumber,
    usePrefix,
  };

  const getAll = (url?: string, params?: Record<string, any>) => {
    return useApiQuery<T[] | any>(
      [resource, 'list', JSON.stringify(params)],
      {
        ...baseConfig,
        url: url || `/${resource}`,
        method: 'GET', 
        params,
        metadata: {
          errorMessage: `Failed to fetch ${resource} list`,
        },
      }
    );
  };

  const getOne = (url?: string, params?: Record<string, any>) => {
    return useApiQuery<T>(
      [resource, 'one', JSON.stringify(params)],
      {
        ...baseConfig,
        url: url || `/${resource}`,
        method: 'GET', 
        params,
        metadata: {
          errorMessage: `Failed to fetch ${resource}`,
        },
      }
    );
  };

  const createMutation = useApiMutation<T>({
    ...baseConfig,
    url: `/${resource}`,
    method: 'POST',
    metadata: {
      successMessage: `${resource} created successfully`,
      errorMessage: `Failed to create ${resource}`,
    },
  });

  const updateMutation = useApiMutation<T & { url?: string }>({
    ...baseConfig,
    url: `/${resource}`,
    method: 'PUT',
    metadata: {
      successMessage: `${resource} updated successfully`,
      errorMessage: `Failed to update ${resource}`,
    },
  }, {
    onMutate: (data: any) => {
      if (data?.url) {
        return { ...data, url: data.url };
      }
      return data;
    }
  });

  const deleteMutation = useApiMutation<{ url: string }>({
    ...baseConfig,
    url: `/${resource}`,
    method: 'DELETE',
    metadata: {
      successMessage: `${resource} deleted successfully`,
      errorMessage: `Failed to delete ${resource}`,
    },
  }, {
    onMutate: (data: any) => {
      if (data?.url) {
        return { url: data.url };
      }
      return data;
    }
  });

  const createOne = (url?: string) => {
    return useApiMutation<T>({
      ...baseConfig,
      url: url || `/${resource}`,
      method: 'POST',
      metadata: {
        successMessage: `${resource} created successfully`,
        errorMessage: `Failed to create ${resource}`,
      },
    });
  };

  return {
    getAll,
    getOne,
    createMutation,
    updateMutation,
    deleteMutation,
    createOne
  };
}

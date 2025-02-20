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

  const getOne = (id: string | number) => {
    return useApiQuery<T>(
      [resource, id.toString()],
      {
        ...baseConfig,
        url: `/${resource}/${id}`,
        method: 'GET',  // Added required method
        metadata: {
          errorMessage: `Failed to fetch ${resource}`,
        },
      }
    );
  };

  const createOne = (url?: string, params?: Record<string, any>) => {
    return useApiMutation<T>(
      {
        ...baseConfig,
        url: url || `/${resource}`,
        method: 'POST',
        params,
        metadata: {
          successMessage: `${resource} created successfully`,
          errorMessage: `Failed to create ${resource}`,
        },
      }
    );
  };

  const updateOne = (id: string | number) => {
    return useApiMutation<T>(
      {
        ...baseConfig,
        url: `/${resource}/${id}`,
        method: 'PUT',
        metadata: {
          successMessage: `${resource} updated successfully`,
          errorMessage: `Failed to update ${resource}`,
        },
      }
    );
  };

  const deleteOne = (id: string | number) => {
    return useApiMutation<void>(
      {
        ...baseConfig,
        url: `/${resource}/${id}`,
        method: 'DELETE',
        metadata: {
          successMessage: `${resource} deleted successfully`,
          errorMessage: `Failed to delete ${resource}`,
        },
      }
    );
  };

  return {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
  };
}

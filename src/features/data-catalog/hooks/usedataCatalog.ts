import { useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { DataSourcePaginatedResponse, DataSourceMutationData } from '@/types/data-catalog/dataCatalog';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseDataCatalogOptions {
  shouldFetch?: boolean;
  dataSourceId?: string;
}

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'fetch';
  context?: string;
  silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
  const { action, context = 'data source', silent = false } = options;
  const errorMessage = `Failed to ${action} ${context}`;
  console.error(`${errorMessage}:`, error);
  if (!silent) {
    toast.error(errorMessage);
  }
  throw error;
};

export const useDataCatalog = (options: UseDataCatalogOptions = { shouldFetch: true }) => {
  // For queries - returns DataSourcePaginatedResponse
  const { getOne: getDataSource, getAll: getAllDataSources } = useResource<DataSourcePaginatedResponse>(
    'data_source',
    CATALOG_API_PORT,
    true
  );

  // For mutations - accepts DataSourceMutationData
  const { 
    create: createDataSource,
    update: updateDataSource,
    remove: removeDataSource
  } = useResource<DataSourceMutationData>(
    'data_source',
    CATALOG_API_PORT,
    true
  );

  // List data sources with pagination
  const result = getAllDataSources({
    url: '/data_source/list/',
    queryOptions: {
      enabled: true,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true
    },
    params: {limit:1000}
  });

  // If you want to fetch a single data source by ID
  const { data: datasource, isLoading: isDataSourceLoading, isFetching: isDataSourceFetching, isError: isDataSourceError } = getDataSource({
    url: `/data_source/${options.dataSourceId}/`,
    queryOptions: {
      enabled: options.shouldFetch && !!options.dataSourceId,
      retry: 2,
      refetchOnWindowFocus: false
    }
  });

  // Create data source mutation
  const createDataSourceMutation = createDataSource({
    url: '/data_source/create/',
    mutationOptions: {
      onSuccess: () => {
        toast.success('Data source created successfully');
        result.refetch();
      },
      onError: (error) => handleApiError(error, { action: 'create' }),
    },
  });

  // Update data source mutation
  const updateDataSourceMutation = updateDataSource('/data_source', {
    mutationOptions: {
      onSuccess: () => {
        toast.success('Data source updated successfully');
        result.refetch();
      },
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // Delete data source mutation
  const deleteDataSourceMutation = removeDataSource('/data_source', {
    mutationOptions: {
      onSuccess: () => {
        toast.success('Data source deleted successfully');
        result.refetch();
      },
      onError: (error) => handleApiError(error, { action: 'delete' }),
    },
  });

  // Type-safe mutation handlers
  const handleCreateDataSource = useCallback(async (data: DataSourceMutationData) => {
    await createDataSourceMutation.mutateAsync({
      data
    });
  }, [createDataSourceMutation]);

  const handleUpdateDataSource = useCallback(async (id: string, data: DataSourceMutationData) => {
    await updateDataSourceMutation.mutateAsync({
      data,
      url: `/data_source/${id}/`
    });
  }, [updateDataSourceMutation]);

  const handleDeleteDataSource = useCallback(async (id: string) => {
    await deleteDataSourceMutation.mutateAsync({
      params: { id }
    });
  }, [deleteDataSourceMutation]);

  return {
    // Query results
    datasources: result.data || [],
    datasource: datasource?.[0] || null,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    isDataSourceLoading,
    isDataSourceFetching,
    isDataSourceError,
    refetch: result.refetch,

    // Mutation handlers
    handleCreateDataSource,
    handleUpdateDataSource,
    handleDeleteDataSource,
  };
};

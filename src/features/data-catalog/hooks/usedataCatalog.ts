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
  const fetchDataSourceList = (enabled = true) =>
    getAllDataSources({
      url: '/data_source/list/',
      queryOptions: {
        enabled,
        retry: 2
      }
    });

  // If you want to fetch a single data source by ID
  const fetchDataSourceById = (dataSourceId: string, enabled = true) =>
    getDataSource({
      url: `/data_source/${dataSourceId}/`,
      queryOptions: {
        enabled,
        retry: 2
      }
    });

  // Create data source mutation
  const createDataSourceMutation = createDataSource({
    url: '/data_source/create/',
    mutationOptions: {
      onSuccess: () => toast.success('Data source created successfully'),
      onError: (error) => handleApiError(error, { action: 'create' }),
    },
  });

  // Update data source mutation
  const updateDataSourceMutation = updateDataSource('/data_source', {
    mutationOptions: {
      onSuccess: () => toast.success('Data source updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // Delete data source mutation
  const deleteDataSourceMutation = removeDataSource('/data_source', {
    mutationOptions: {
      onSuccess: () => toast.success('Data source deleted successfully'),
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

  // Get current data source list if shouldFetch is true
  const { data: datasources, isLoading, isFetching, isError } = fetchDataSourceList(options.shouldFetch);

  // Get single data source if ID is provided
  const { 
    data: datasource,
    isLoading: isDataSourceLoading,
    isFetching: isDataSourceFetching,
    isError: isDataSourceError 
  } = fetchDataSourceById(options.dataSourceId || '', options.shouldFetch && !!options.dataSourceId);

  return {
    // Query results
    datasources: datasources || [],
    datasource: datasource?.[0] || null,
    isLoading,
    isFetching,
    isError,
    isDataSourceLoading,
    isDataSourceFetching,
    isDataSourceError,

    // Query functions
    fetchDataSourceList,
    fetchDataSourceById,

    // Mutation handlers
    handleCreateDataSource,
    handleUpdateDataSource,
    handleDeleteDataSource,
  };
};

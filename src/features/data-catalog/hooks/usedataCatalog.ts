import { useCallback, useMemo } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { DataSource, DataSourcePaginatedResponse, DataSourceMutationData } from '@/types/data-catalog/dataCatalog';
import { toast } from 'sonner';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface UseDataCatalogOptions {
  shouldFetch?: boolean;
  dataSourceId?: string;
  limit?: number;
  offset?: number;
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
  // For queries - returns DataSource
  const { getOne: getDataSource, getAll: getAllDataSources } = useResource<DataSource>(
    'data_source',
    CATALOG_REMOTE_API_URL,
    true
  );

  // For mutations - accepts DataSourceMutationData
  const { 
    create: createDataSource,
    update: updateDataSource,
    remove: removeDataSource
  } = useResource<DataSourceMutationData>(
    'data_source',
    CATALOG_REMOTE_API_URL,
    true
  );

  const queryParams = useMemo(() => ({
    limit: options.limit ?? 10,
    offset: options.offset ?? 0,
  }), [options.limit, options.offset]);

  // List data sources with pagination
  const {
    data: dataSourceListResponse,
    isLoading,
    isFetching,
    isError,
    refetch
  } = getAllDataSources<DataSourcePaginatedResponse, any>({
    url: '/data_source/list/',
    queryOptions: {
      enabled: !!options.shouldFetch,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true
    },
    params: queryParams
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
        refetch();
      },
      onError: (error) => handleApiError(error, { action: 'create' }),
    },
  });

  // Update data source mutation
  const updateDataSourceMutation = updateDataSource('/data_source', {
    mutationOptions: {
      onSuccess: () => {
        toast.success('Data source updated successfully');
        refetch();
      },
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // Delete data source mutation
  const deleteDataSourceMutation = removeDataSource('/data_source', {
    mutationOptions: {
      onSuccess: () => {
        toast.success('Data source deleted successfully');
        refetch();
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

  const datasources = dataSourceListResponse?.data || [];
  const total = dataSourceListResponse?.total || 0;
  const offset = dataSourceListResponse?.offset || 0;
  const limit = dataSourceListResponse?.limit || 0;
  const prev = dataSourceListResponse?.prev || false;
  const next = dataSourceListResponse?.next || false;

  return {
    // Query results
    datasources,
    datasource: datasource?.[0] || null,
    isLoading,
    isFetching,
    isError,
    isDataSourceLoading,
    isDataSourceFetching,
    isDataSourceError,
    refetch,
    total,
    offset,
    limit,
    prev,
    next,

    // Mutation handlers
    handleCreateDataSource,
    handleUpdateDataSource,
    handleDeleteDataSource,
  };
};

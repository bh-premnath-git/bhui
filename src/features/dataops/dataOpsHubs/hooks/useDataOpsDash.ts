import { useResource } from '@/hooks/api/useResource';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { Dashboard, Dashboards, Widget } from '@/types/dataops/dataops-dash';
import { useQueries } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { ApiConfig } from '@/lib/api/api-config';

// URL paths for DataOps dashboard API
const DASHBOARD_API_PATH = 'dashboard';
const WIDGET_API_PATH = 'widgets';

interface UseDataOpsDashOptions {
  shouldFetch?: boolean;
  dashboardId?: number | string;
}

interface UseWidgetOptions {
  shouldFetch?: boolean;
  widgetId?: number | string;
  widgetIds?: (number | string)[];
}

/**
 * Hook for fetching and managing DataOps dashboards
 */
export const useDataOpsDashboards = (options: UseDataOpsDashOptions = { shouldFetch: true }) => {
  const { getOne: getDashboard, getAll: getAllDashboards } = useResource<Dashboard>(
    DASHBOARD_API_PATH,
    CATALOG_REMOTE_API_URL,
    true
  );

  // Get all dashboards with dashboard_type=dataops filter
  const { 
    data: dashboards, 
    isLoading, 
    isFetching, 
    isError,
    refetch
  } = getAllDashboards({
    url: `/${DASHBOARD_API_PATH}/list/`,
    queryOptions: {
      enabled: options.shouldFetch,
      retry: 2
    },
    query: 'dashboard_type=dataops'
  }) as {
    data: Dashboards;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  // Get a specific dashboard by ID
  const {
    data: dashboardDetail,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    isError: isDashboardError
  } = options.dashboardId ? getDashboard({
    url: `/${DASHBOARD_API_PATH}/${options.dashboardId}/`,
    queryOptions: {
      enabled: !!options.dashboardId,
      retry: 2,
      staleTime: 60000 // 1 minute
    }
  }) : {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false
  };

  return {
    dashboards: dashboards || [],
    dashboardDetail,
    isLoading,
    isFetching,
    isError,
    isDashboardLoading,
    isDashboardFetching,
    isDashboardError,
    refetch
  };
};

/**
 * Hook for fetching and managing widgets for DataOps dashboards
 */
export const useDataOpsWidgets = (options: UseWidgetOptions = { shouldFetch: true }) => {
  // For single widget fetching
  const { getOne: getWidget } = useResource<Widget>(
    WIDGET_API_PATH,
    CATALOG_REMOTE_API_URL,
    true
  );
  
  const widgetIds = options.widgetIds || [];
  
  // Get a specific widget by ID (if single widgetId is provided)
  const {
    data: widgetDetail,
    isLoading: isWidgetLoading,
    isFetching: isWidgetFetching,
    isError: isWidgetError
  } = options.widgetId ? getWidget({
    url: `/${WIDGET_API_PATH}/${options.widgetId}`,
    queryOptions: {
      enabled: !!options.widgetId && options.shouldFetch,
      retry: 2,
      staleTime: 60000 // 1 minute
    }
  }) : {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false
  };
  
  // Use useQueries with apiService public methods for fetching multiple widgets
  const widgetQueries = useQueries({
    queries: widgetIds
      .filter(id => id != null)
      .map(id => ({
        queryKey: ['widget', id.toString()],
        queryFn: async () => {
          // Use the public get method of apiService
          const config: ApiConfig = {
            url: `/${WIDGET_API_PATH}/${id}`,
            method: 'GET',
            baseUrl: CATALOG_REMOTE_API_URL,
            usePrefix: true
          };
          
          return await apiService.get<Widget>(config);
        },
        enabled: options.shouldFetch,
        staleTime: 60000,
        retry: 2
      }))
  });
  
  const isLoading = widgetQueries.some(q => q.isLoading) || isWidgetLoading;
  const isFetching = widgetQueries.some(q => q.isFetching) || isWidgetFetching;
  const isError = widgetQueries.some(q => q.isError) || isWidgetError;
  const widgets = widgetQueries.map(q => q.data).filter(Boolean) as Widget[];

  return {
    widgets,
    widgetDetail,
    isLoading,
    isFetching,
    isError,
    refetch: () => {
      widgetQueries.forEach(q => q.refetch());
    }
  };
};
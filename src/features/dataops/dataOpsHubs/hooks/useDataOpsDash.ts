import { useResource } from '@/hooks/api/useResource';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { Dashboard, Dashboards, Widget } from '@/types/dataops/dataops-dash';
// URL paths for DataOps dashboard API
const DASHBOARD_API_PATH = 'dashboard';
const WIDGET_API_PATH = 'widgets';

interface UseDataOpsDashOptions {
  shouldFetch?: boolean;
  dashboardId?: number | string;
  type?: string;
  id?: number;
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

  // Default to data-ops if not provided
  const dashboardType = options.type || 'data-ops';

  // Build query string based on provided options
  const queryString = options.id !== undefined && 
                     options.id !== null && 
                     !isNaN(Number(options.id)) && 
                     Number(options.id) > 0
    ? `dashboard_type=${dashboardType}&id=${options.id}`
    : `dashboard_type=${dashboardType}`;

  // Get all dashboards with dashboard_type (and optional id) filter
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
    query: queryString
  }) as {
    data: { data: Dashboards };
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
    dashboards: dashboards?.data || [],
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
export const useDataOpsWidgets = (options: UseWidgetOptions = {}) => {
  const { shouldFetch = true, widgetId, widgetIds = [] } = options;

  const { getOne: getWidget, create, remove } = useResource<Widget>(
    WIDGET_API_PATH,
    CATALOG_REMOTE_API_URL,
    true
  );
  const {
    data: widgetDetail,
    isLoading: isWidgetLoading,
    isFetching: isWidgetFetching,
    isError: isWidgetError,
    refetch: refetchWidgetDetail,
  } = widgetId
    ? getWidget({
        url: `/${WIDGET_API_PATH}/${widgetId}`,
        id: widgetId,
        queryOptions: { 
          enabled: shouldFetch,
          retry: 2,
          staleTime: 60_000,
        },
      })
    : {
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: () => {},
      };

  const { getAll: getWidgets } = useResource<Widget>(
    WIDGET_API_PATH,
    CATALOG_REMOTE_API_URL,
    true
  );
  const {
    data: widgetsResponse,
    isLoading: isWidgetsLoading,
    isFetching: isWidgetsFetching,
    isError: isWidgetsError,
    refetch: refetchWidgets,
  } = getWidgets({
    url: `/${WIDGET_API_PATH}/list/`,
    queryOptions: {
      enabled: shouldFetch && widgetIds.length > 0,
      retry: 2,
    },

    query: widgetIds.map((id) => `ids=${id}`).join('&'),
  }) as {
    data:  Widget[];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const { mutateAsync: createWidgetMutation }  = create({
    url: `/widgets`,
    mutationOptions: {
      retry: 2
    }
  });

  const { mutateAsync: deleteWidgetMutation } = remove('/widgets', {
    mutationOptions: {
      retry: 2
    }
  });

  const createWidget = (payload: any) => {
    return createWidgetMutation({ data: payload });
  };

  const deleteWidget = (widgetId: string | number) => {
    return deleteWidgetMutation({
      url: `/widgets/${widgetId}/`
    });
  };

  const widgets = widgetsResponse || [];

  return {
    widgets,
    widgetDetail,
    isLoading: widgetId ? isWidgetLoading : isWidgetsLoading,
    isFetching: widgetId ? isWidgetFetching : isWidgetsFetching,
    isError: widgetId ? isWidgetError : isWidgetsError,
    refetch: widgetId ? refetchWidgetDetail : refetchWidgets,
    createWidget,
    deleteWidget
  };

};
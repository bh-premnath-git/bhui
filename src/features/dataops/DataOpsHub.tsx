import { useEffect } from "react";
import Dashboard from "@/features/dataops/dashboard";
import { useDataOpsDashboards, useDataOpsWidgets } from "@/features/dataops/dataOpsHubs/hooks/useDataOpsDash";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { addWidget } from "@/store/slices/dataops/dashboardStore";

export function DataOpsHub() {
  const dispatch = useAppDispatch();
  const { widgets } = useAppSelector((state) => state.dashboard);
  
  const {
    dashboards,
    isLoading: isDashboardsLoading,
    isError: isDashboardsError,
  } = useDataOpsDashboards({
    shouldFetch: true,
  });

  const widgetIds = dashboards?.[0]?.dashboard_layout?.map(layout => layout.widget_id) || [];

  const {
    widgets: apiWidgets,
    isLoading: isWidgetsLoading,
    isError: isWidgetsError,
  } = useDataOpsWidgets({
    shouldFetch: widgetIds.length > 0,
    widgetIds,
  });

  // Initialize widgets from API on mount
  useEffect(() => {
    if (apiWidgets && apiWidgets.length > 0) {
      apiWidgets.forEach((widget) => {
        const widgetId = String(widget.id); // Ensure ID is a string
        if (!widgets[widgetId]) {
          const { id, ...restOfWidget } = widget;
          dispatch(
            addWidget({
              ...restOfWidget,
              id: widgetId,
            })
          );
        }
      });
    }
  }, [apiWidgets, dispatch, widgets]);

  if (isDashboardsLoading || isWidgetsLoading) {
    return <LoadingState />;
  }

  if (isDashboardsError || isWidgetsError) {
    return <ErrorState message="Failed to load dashboard data" />;
  }
  
  return (
    <div className="absolute inset-0">
       <Dashboard />
    </div>
  );
}

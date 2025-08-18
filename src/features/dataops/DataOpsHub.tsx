import { useEffect, useMemo } from "react";
import Dashboard from "@/features/dataops/dashboard";
import { useDataOpsDashboards, useDataOpsWidgets } from "@/features/dataops/dataOpsHubs/hooks/useDataOpsDash";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { addWidget, setLayoutMap } from "@/store/slices/dataops/dashboardSlice";

export function DataOpsHub() {
  const dispatch = useAppDispatch();
  const { widgets, layoutMap } = useAppSelector((state) => state.dashboard);

  const {
    dashboards,
    isLoading: isDashboardsLoading,
    isError: isDashboardsError,
  } = useDataOpsDashboards({ shouldFetch: true });

  const widgetIds = dashboards?.[0]?.dashboard_layout?.map(l => String(l.widget_id)) || [];

  const {
    widgets: apiWidgets,
    isLoading: isWidgetsLoading,
    isError: isWidgetsError,
  } = useDataOpsWidgets({
    shouldFetch: widgetIds.length > 0,
    widgetIds,
  });

  // Create layoutMap from dashboard definition and store it in Redux
  const dashboardLayoutMap = useMemo(() => {
    const dl = dashboards?.[0]?.dashboard_layout || [];
    const layoutObj: Record<string, { layout_id: string; x: number; y: number; w: number; h: number; order_index: string }> = {};
    
    dl.forEach((it: any) => {
      const widgetId = String(it.widget_id);
      layoutObj[widgetId] = {
        layout_id: String(it.id),
        x: it.widget_coordinates?.x ?? (Number.isFinite(it.x) ? it.x : 0),
        // if y is missing, let RGL auto-place
        y: it.widget_coordinates?.y ?? (Number.isFinite(it.y) ? it.y : Number.POSITIVE_INFINITY),
        w: it.widget_size?.w ?? (Number.isFinite(it.w) ? it.w : 4),
        h: it.widget_size?.h ?? (Number.isFinite(it.h) ? it.h : 6),
        order_index: it.order_index ? String(it.order_index) : '0',
      };
    });
    
    return layoutObj;
  }, [dashboards]);

  // Update the store's layoutMap when dashboard layout changes
  useEffect(() => {
    if (Object.keys(dashboardLayoutMap).length > 0) {
      dispatch(setLayoutMap(dashboardLayoutMap));
    }
  }, [dashboardLayoutMap, dispatch]);

  useEffect(() => {
    if (!apiWidgets || apiWidgets.length === 0) return;

    apiWidgets.forEach((widget) => {
      const widgetId = String(widget.id);
      if (!widgets[widgetId]) {
        const { id, ...rest } = widget;
        dispatch(
          addWidget({
            ...rest,
            id: widgetId,
            layout: layoutMap[widgetId], // use layoutMap from store
          })
        );
      }
    });
  }, [apiWidgets, dispatch, widgets, layoutMap]);

  if (isDashboardsLoading || isWidgetsLoading) return <LoadingState />;
  if (isDashboardsError || isWidgetsError) return <ErrorState message="Failed to load dashboard data" />;

  return (
    <div className="absolute inset-0">
      <Dashboard />
    </div>
  );
}

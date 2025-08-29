import { useEffect } from "react";
import { CHART_ADDED_EVENT, WIDGET_REMOVED_EVENT } from "@/components/shared/XplorerGenericChat";
import { useDashboard } from "@/context/DashboardContext";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { useDataOpsDashboards, useDataOpsWidgets } from "@/features/dataops/dataOpsHubs/hooks/useDataOpsDash";
import { decompressValue, compressValue } from "@/lib/decompress";
import { XploreDash } from "./components/xploredash/XploreDash";

interface XplorerProps {
  dashboardId?: string;
}

export function Xplorer({ dashboardId  }: XplorerProps) {
  const { state, dispatch, dispatchAsync } = useDashboard();
  const {
    dashboards,
    isLoading: isDashboardsLoading,
    isError: isDashboardsError,
  } = useDataOpsDashboards({
    type: "explorer",
    shouldFetch: true,
    id: parseInt(dashboardId),
  });

  // Get widget IDs from dashboard layout if available
  const widgetIds = dashboards?.filter((dashboard) => dashboard.id?.toString() === dashboardId)?.flatMap(dashboard =>
    dashboard.dashboard_layout?.map(layout => layout.widget_id?.toString()) || []
  ) || [];

  // Fetch widgets for this dashboard
  const {
    widgets,
    isLoading: isWidgetsLoading,
    isError: isWidgetsError,
    createWidget,
    deleteWidget,
  } = useDataOpsWidgets({
    shouldFetch: widgetIds.length > 0,
    widgetIds: widgetIds
  });

  const handleWidgetRefresh = async (widgetId: string) => {
    try {
      } catch (error) {
      console.error("Failed to refresh widget:", error);
    }
  };

  // Manage loading state based on dashboard and widget fetches
  useEffect(() => {
    const currentOverallLoading = isDashboardsLoading || isWidgetsLoading;
    if (state.isLoading !== currentOverallLoading) {
      dispatch({ type: "SET_LOADING", payload: currentOverallLoading });
    }
  }, [isDashboardsLoading, isWidgetsLoading, dispatch, state.isLoading]);

  // Process and set widgets once they are fetched
  useEffect(() => {
    try {
      if (widgets?.length && !state.widgets.length) {
        const intermediateWidgets = widgets.map(widget => {
          widget.intermediate_executed_query_json = decompressValue(widget.plotly_data);
          return widget;
        });
        dispatch({ type: "SET_WIDGETS", payload: intermediateWidgets });
      }
    } catch (error) {
      console.error("[Xplorer] Failed to process and set widgets:", error);
      dispatch({ type: "SET_ERROR", payload: "Error processing widget data." });
    }
  }, [widgets, dispatch, state.widgets.length]);

  // Listen for widget removal events coming from Generic Chat UI
  useEffect(() => {
    try {
      const handleWidgetRemoved = (event: CustomEvent) => {
        if (!event.detail) {
          console.error("[Xplorer] Widget removal event missing detail data");
          return;
        }
        const widgetId = event.detail.widgetId;
        const widget = state.widgets.find(w => w.id?.toString() === widgetId.toString());
        if (!widget || widget.widget_type !== "user_defined") {
          return;
        }
        dispatch({ type: "REMOVE_WIDGET", payload: widgetId });
        deleteWidget(widgetId);
      };
      document.addEventListener(WIDGET_REMOVED_EVENT, handleWidgetRemoved as EventListener);
      return () => {
        document.removeEventListener(WIDGET_REMOVED_EVENT, handleWidgetRemoved as EventListener);
      };
    } catch (error) {
      console.error("[Xplorer] Failed to setup widget removed listener:", error);
      return () => {};
    }
  }, [state.widgets, deleteWidget, dispatch]);

  // Listen for chart additions from Generic Chat UI and persist them
  useEffect(() => {
    try {
      const handleChartAdded = (event: CustomEvent) => {
        if (!event.detail) {
          console.error("[Xplorer] Chart event missing detail data");
          return;
        }
        const chartDataFromEvent = event.detail;
        const { intermediate_executed_query_json, dashboardId: dashboardIdFromEvent, ...restOfChartData } = chartDataFromEvent;

        // Prepare data for backend persistence
        const payloadForCreateWidget = {
          dashboard_id: parseInt(dashboardIdFromEvent),
          name: restOfChartData.name,
          widget_type: restOfChartData.widget_type,
          sql_query: restOfChartData.sql_query,
          chart_config: compressValue(intermediate_executed_query_json),
          plotly_data: compressValue(intermediate_executed_query_json),
          executed_query: restOfChartData.executed_query,
          connection_id: restOfChartData.connectionId
        } as const;

        // Update local dashboard state ONLY if the widget belongs to the Xplorer dashboard (id 102)
        if (parseInt(dashboardIdFromEvent) === 102) {
          dispatchAsync({ type: "ADD_WIDGET", payload: chartDataFromEvent }).then(() => {
            createWidget(payloadForCreateWidget);
          });
        } else {
          // For other dashboards, just persist the widget without mutating Xplorer context
          createWidget(payloadForCreateWidget);
        }
      };
      document.addEventListener(CHART_ADDED_EVENT, handleChartAdded as EventListener);
      return () => {
        document.removeEventListener(CHART_ADDED_EVENT, handleChartAdded as EventListener);
      };
    } catch (error) {
      console.error("[Xplorer] Failed to setup chart event listener:", error);
      dispatch({ type: "SET_ERROR", payload: "Error setting up chart functionality." });
      return () => {};
    }
  }, [state.selectedDashboard, dashboardId, dispatchAsync, createWidget, dispatch]);

  // Handle error state
  useEffect(() => {
    try {
      let newErrorMessage: string | null = null;
      if (isDashboardsError) {
        newErrorMessage = (isDashboardsError as any)?.message || "Failed to load dashboards. Please try again later.";
      } else if (isWidgetsError) {
        newErrorMessage = (isWidgetsError as any)?.message || "Failed to load widget data. Some items may not display correctly.";
      }

      if (state.error !== newErrorMessage) {
        dispatch({ type: "SET_ERROR", payload: newErrorMessage });
      }
    } catch (e) {
      const unexpectedErrorMessage = "An unexpected error occurred while processing error state.";
      if (state.error !== unexpectedErrorMessage) {
        dispatch({ type: "SET_ERROR", payload: unexpectedErrorMessage });
      }
    }
  }, [isDashboardsError, isWidgetsError, dispatch, state.error]);

  if (state.isLoading) {
    return <LoadingState fullScreen />;
  }

  if (state.error) {
    return (
      <div className="p-6">
        <ErrorState
          message={state.error}
        />
      </div>
    );
  }

  return state.widgets.length > 0 ? (
    <XploreDash widgets={state.widgets} onWidgetRefresh={handleWidgetRefresh} />
  ) : (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 m-1">
      <div className="text-center p-1">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No widgets yet for Main Report</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding widgets to your data explorer.</p>
        <p className="text-xs text-gray-400 mt-2">Use the AI Chat to analyze data and create visualizations</p>
      </div>
    </div>
  );
}

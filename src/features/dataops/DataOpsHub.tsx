import { useEffect } from "react";
import Dashboard from "@/features/dataops/dashboard"
import { useDataOpsDashboards, useDataOpsWidgets } from "@/features/dataops/dataOpsHubs/hooks/useDataOpsDash"
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { useDataOps } from "@/context/dataops/DataOpsContext";
import { CHART_ADDED_EVENT } from "@/components/shared/GenericChatUI";
import { decompressValue, compressValue } from "@/lib/decompress";
export function DataOpsHub() {
  const { state, dispatch, dispatchAsync } = useDataOps();
  const {
    dashboards,
    isLoading: isDashboardsLoading,
    isError: isDashboardsError,
  } = useDataOpsDashboards({
    shouldFetch: true,
  });

  const widgetIds = dashboards?.[0]?.dashboard_layout?.map(layout => layout.widget_id) || [];

  const {
    widgets,
    isLoading: isWidgetsLoading,
    isError: isWidgetsError,
    createWidget
  } = useDataOpsWidgets({
    shouldFetch: widgetIds.length > 0,
    widgetIds: widgetIds
  });

  useEffect(() => {
    const currentOverallLoading = isDashboardsLoading || isWidgetsLoading;
    if (state.isLoading !== currentOverallLoading) {
      dispatch({ type: "SET_LOADING", payload: currentOverallLoading });
    }
  }, [isDashboardsLoading, isWidgetsLoading, dispatch, state.isLoading]);

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
      console.error("[DataOpsHub] Error in error handling effect:", e);
      const unexpectedErrorMessage = "An unexpected error occurred while processing error state.";
      if (state.error !== unexpectedErrorMessage) {
        dispatch({ type: "SET_ERROR", payload: unexpectedErrorMessage });
      }
    }
  }, [isDashboardsError, isWidgetsError, isDashboardsError, isWidgetsError, dispatch, state.error]);

  useEffect(() => {
    try {
      if (dashboards?.length && !state.dashboards.length) {
        dispatch({ type: "SET_DASHBOARDS", payload: dashboards });
        if (dashboards[0]) {
          dispatch({ type: "SET_SELECTED_DASHBOARD", payload: dashboards[0] });
        }
      }
    } catch (error) {
      console.error("[DataOpsHub] Failed to process and set dashboards:", error);
      dispatch({ type: "SET_ERROR", payload: "Error processing dashboard data." });
    }
  }, [dashboards, dispatch, state.dashboards.length]);

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
      console.error("[DataOpsHub] Failed to process and set widgets:", error);
      dispatch({ type: "SET_ERROR", payload: "Error processing widget data." });
    }
  }, [widgets, dispatch, state.widgets.length]);


  useEffect(() => {
    try {
      // Define handler function
      const handleChartAdded = (event: CustomEvent) => {
        // Type safety check
        if (!event.detail) {
          console.error("[DataOpsHub] Chart event missing detail data");
          return;
        }

        const chartDataFromEvent = event.detail; // Contains full structure from GenericChatUI
        const { intermediate_executed_query_json, ...restOfChartData } = chartDataFromEvent;
        
        // Optimistic update with the full structure received from the event
        dispatchAsync({ type: "ADD_WIDGET", payload: chartDataFromEvent }).then(() => {
          // Prepare payload for the backend
          const payloadForCreateWidget = {
            dashboard_id: state.selectedDashboard.dashboard_id ?? 101,
            name: restOfChartData.name,
            widget_type: restOfChartData.widget_type,
            sql_query: restOfChartData.sql_query,
            // Use the simple chart_config from the event detail
            chart_config: restOfChartData.chart_config, 
            // Store the full Plotly JSON (data & layout) compressed in plotly_data
            plotly_data: compressValue(intermediate_executed_query_json), 
            executed_query: restOfChartData.executed_query,
            // Ensure other necessary fields for widget creation are included
            // For example, if the backend expects 'description' or 'metric' in chart_config,
            // ensure they are present in chartDataFromEvent.chart_config
          };
          createWidget(payloadForCreateWidget);
        });
      };

      // Register event listener
      document.addEventListener(CHART_ADDED_EVENT, handleChartAdded as EventListener);
      
      // Cleanup function
      return () => {
        document.removeEventListener(CHART_ADDED_EVENT, handleChartAdded as EventListener);
      };
    } catch (error) {
      console.error("[DataOpsHub] Failed to setup chart event listener:", error);
      dispatch({ type: "SET_ERROR", payload: "Error setting up chart functionality." });
      return () => {}; // Empty cleanup function
    }
  }, [state.selectedDashboard, dispatchAsync, createWidget, dispatch]);

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

  return (<div className="absolute inset-0"><Dashboard /></div>);
}

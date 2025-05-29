import { useEffect } from "react";
import Dashboard from "@/features/dataops/dashboard"
import { useDataOpsDashboards, useDataOpsWidgets } from "@/features/dataops/dataOpsHubs/hooks/useDataOpsDash"
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { useDataOps } from "@/context/dataops/DataOpsContext";

export function DataOpsHub() {
  const { state, dispatch } = useDataOps();
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
        dispatch({ type: "SET_WIDGETS", payload: widgets });
      }
    } catch (error) {
      console.error("[DataOpsHub] Failed to process and set widgets:", error);
      dispatch({ type: "SET_ERROR", payload: "Error processing widget data." });
    }
  }, [widgets, dispatch, state.widgets.length]);

  if (state.isLoading) {
    return <LoadingState />;
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

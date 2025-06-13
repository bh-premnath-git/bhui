import React, { useEffect } from 'react';
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { useDashboard } from "@/context/DashboardContext";
import { useLocation, useParams } from 'react-router-dom';
import { WIDGET_REMOVED_EVENT } from "@/components/shared/XplorerGenericChat";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { useDataOpsDashboards, useDataOpsWidgets } from "@/features/dataops/dataOpsHubs/hooks/useDataOpsDash";
import { decompressValue } from "@/lib/decompress";
import { XploreDash } from "../../../features/data-catalog/components/xploredash/XploreDash";

const NoWidgetsDisplay = () => {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const reportName = searchParams.get('reportName');

  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 m-4">
      <div className="text-center p-5">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No widgets yet for {reportName || "this Report"}</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding widgets to your data explorer.</p>
        <p className="text-xs text-gray-400 mt-2">Use the AI Chat to analyze data and create visualizations</p>
      </div>
    </div>
  );
};

const ReportDetailsContent: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();

  const { state, dispatch } = useDashboard();

  const {
    dashboards,
    isLoading: isDashboardsLoading,
    isError: isDashboardsError,
  } = useDataOpsDashboards({
    type: "explorer",
    shouldFetch: true,
    id: reportId ? parseInt(reportId, 10) : undefined,
  });

  // Convert widget IDs to strings for consistent comparison
  const widgetIds = dashboards?.filter((dashboard) => dashboard.id?.toString() === reportId)?.flatMap(dashboard =>
    dashboard.dashboard_layout?.map(layout => layout.widget_id?.toString()) || []
  ) || [];

  const {
    widgets,
    isLoading: isWidgetsLoading,
    isError: isWidgetsError,
    deleteWidget
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

  // Mirror loading state from data fetches into DashboardContext
  useEffect(() => {
    const currentOverallLoading = isDashboardsLoading || isWidgetsLoading;
    if (state.isLoading !== currentOverallLoading) {
      dispatch({ type: "SET_LOADING", payload: currentOverallLoading });
    }
  }, [isDashboardsLoading, isWidgetsLoading, state.isLoading, dispatch]);

  // Propagate API errors into DashboardContext
  useEffect(() => {
    let newErrorMessage: string | null = null;

    if (isDashboardsError) {
      newErrorMessage = (isDashboardsError as any)?.message ||
        "Failed to load dashboards. Please try again later.";
    } else if (isWidgetsError) {
      newErrorMessage = (isWidgetsError as any)?.message ||
        "Failed to load widget data. Some items may not display correctly.";
    }

    if (state.error !== newErrorMessage) {
      dispatch({ type: "SET_ERROR", payload: newErrorMessage });
    }
  }, [isDashboardsError, isWidgetsError, state.error, dispatch]);

  // Populate dashboard context when widgets are fetched
  useEffect(() => {
    if (widgets?.length && !state.widgets.length) {
      const processedWidgets = widgets.map(widget => {
        widget.intermediate_executed_query_json = decompressValue(widget.plotly_data);
        return widget;
      });
      dispatch({ type: "SET_WIDGETS", payload: processedWidgets });
    }
  }, [widgets, state.widgets.length, dispatch]);

  // Listen for widget removal events coming from the Generic Chat UI
  useEffect(() => {
    const handleWidgetRemoved = (event: CustomEvent) => {
      if (!event.detail) return;
      const widgetId = event.detail.widgetId;
      // Ensure the removed widget belongs to this report
      if (!widgetIds.includes(widgetId?.toString())) return;
      dispatch({ type: "REMOVE_WIDGET", payload: widgetId });
      deleteWidget(widgetId);
    };

    document.addEventListener(WIDGET_REMOVED_EVENT, handleWidgetRemoved as EventListener);
    return () => {
      document.removeEventListener(WIDGET_REMOVED_EVENT, handleWidgetRemoved as EventListener);
    };
  }, [widgetIds, dispatch, deleteWidget]);

  // Loading state
  if (state.isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (state.error) {
    return (
      <div className="p-6">
        <ErrorState message={state.error} />
      </div>
    );
  }

  // Only show widgets that belong to this report
  const widgetsForCurrentReport = state.widgets?.filter(widget =>
    widgetIds.includes(widget.id?.toString() || "")
  ) || [];

  return (
    <div className="w-full p-4 bg-white">
      {widgetsForCurrentReport.length > 0 ? (
        <XploreDash widgets={widgetsForCurrentReport} onWidgetRefresh={handleWidgetRefresh}/>
      ) : (
        <NoWidgetsDisplay />
      )}
    </div>
  );
};

const ReportDetails: React.FC = () => {
  const location = useLocation();

  return (
    <div className="p-2">
      <DashboardProvider>
        <AnalyticsProvider>
          <ReportDetailsContent key={location.key || 'default'} />
        </AnalyticsProvider>
      </DashboardProvider>
    </div>
  );
};

export default ReportDetails;

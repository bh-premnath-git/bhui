import { useEffect, useState } from "react";
import { DataOpsProvider } from "@/context/dataops/DataOpsContext"
import Dashboard from "@/features/dataops/dashboard"
import { useDataOpsDashboards, useDataOpsWidgets } from "@/features/dataops/dataOpsHubs/hooks/useDataOpsDash"
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";


export function DataOpsHub() {
  const [widgetIds, setWidgetIds] = useState<number[]>([]);

  const { 
    dashboards,
    isLoading,
    isError,
    isDashboardLoading 
  } = useDataOpsDashboards({
    shouldFetch: true,
  });
  
  // Extract widget IDs from the first dashboard
  useEffect(() => {
    if (dashboards && dashboards.length > 0) {
      // Extract widget IDs from the dashboard layout
      if (dashboards[0].dashboard_layout && dashboards[0].dashboard_layout.length > 0) {
        const ids = dashboards[0].dashboard_layout.map(layout => layout.widget_id);
        setWidgetIds(ids as number[]);
      }
    }
  }, [dashboards]);

  // Fetch widget data for all widgets in the dashboard using individual IDs
  const { 
    widgets,
    isLoading: isWidgetsLoading,
    isError: isWidgetsError
  } = useDataOpsWidgets({
    shouldFetch: widgetIds.length > 0,
    widgetIds: widgetIds // Pass the array of widget IDs to fetch
  });
  
  // Show loading state
  if (isLoading || isDashboardLoading || isWidgetsLoading) {
    return <LoadingState />;
  }

  if (isError || isWidgetsError) {
    return (
      <div className="p-6">
        <ErrorState 
          message="Failed to load dashboard data"
          />
      </div>
    );
  }
  
  console.log("dashboards", dashboards);
  console.log("widgets", widgets);

  return (
    <DataOpsProvider>
      <Dashboard />
    </DataOpsProvider>
  );
}

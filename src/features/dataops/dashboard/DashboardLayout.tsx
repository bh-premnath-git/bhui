import { useMemo, useEffect, useState } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Widget } from "./widgets/Widget";
import { useDataOps } from "@/context/dataops/DataOpsContext";
import { LayoutDashboard } from "lucide-react";
import { updateWidgetLayout } from "@/lib/widgetLayout";
import { useLayoutPersistence } from "@/hooks/useLayoutPersistence";
import { applyFilters } from "@/lib/filterUtils";
import { ExecutedQueryItem } from "@/types/dataops/dataops-dash";
import { useSidebar } from "@/context/SidebarContext";
import "react-grid-layout/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_STORAGE_KEY = 'dashboard_layout';
// Default widget dimensions
const DEFAULT_WIDGET_WIDTH = 6;
const DEFAULT_WIDGET_HEIGHT = 4;

const GridLayout = () => {
  const { state } = useDataOps();
  const { widgets, selectedDashboard, filters, dashboards } = state;
  const { isRightAsideOpen } = useSidebar();
  const [measurementKey, setMeasurementKey] = useState(0);

  // Detect sidebar state changes and trigger re-measurement
  useEffect(() => {
    // Force a re-measurement when sidebar state changes
    setMeasurementKey(prev => prev + 1);
  }, [isRightAsideOpen]);
  
  const { handleLayoutChange } = useLayoutPersistence({
    storageKey: LAYOUT_STORAGE_KEY,
    dashboard: selectedDashboard,
    defaultDimensions: {
      w: DEFAULT_WIDGET_WIDTH,
      h: DEFAULT_WIDGET_HEIGHT
    }
  });

  const orderedWidgets = useMemo(() => {
    if (!selectedDashboard?.dashboard_layout || !widgets.length) return widgets;

    const orderMap = new Map(
      selectedDashboard.dashboard_layout.map(layout => [
        layout.widget_id,
        parseInt(layout.order_index)
      ])
    );

    return [...widgets].sort((a, b) => {
      const orderA = orderMap.get(a.id) || 0;
      const orderB = orderMap.get(b.id) || 0;
      return orderA - orderB;
    });
  }, [widgets, selectedDashboard]);

  const filteredWidgets = useMemo(() => {
    return orderedWidgets.map(widget => {
      // Only apply filters to system-defined widgets with array-based executed_query
      if (widget.widget_type === "system_defined" && Array.isArray(widget.executed_query)) {
        return {
          ...widget,
          executed_query: applyFilters(widget.executed_query as ExecutedQueryItem[], filters)
        };
      }
      return widget;
    });
  }, [orderedWidgets, filters]);

  const renderableWidgets = useMemo(() => {
    return filteredWidgets.filter(widget => widget.id != null);
  }, [filteredWidgets]);

  const onLayoutChange = async (layout: Layout[], allLayouts: any) => {
    const processedLayout = handleLayoutChange(layout, allLayouts);

    if (!selectedDashboard) return;

    try {
      const updates = processedLayout.map((item, index) => ({
        widget_id: parseInt(item.i),
        order_index: (index + 1).toString(),
        widget_coordinates: { x: item.x, y: item.y },
        widget_size: { w: item.w, h: item.h }
      }));

      await updateWidgetLayout(dashboards, selectedDashboard.dashboard_id, updates);
    } catch (error) {
      console.error('Failed to update layout:', error);
    }
  };

  if (renderableWidgets.length === 0) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center bg-card border rounded-lg">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {filters.projectName ? 'No Data Available' : 'Dashboard is Empty'}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {filters.projectName
            ? `No widgets found for project "${filters.projectName}". Try selecting a different project or clearing the filters.`
            : "No widgets have been added to this dashboard yet. Widgets will appear here once they're configured."}
        </p>
      </div>
    );
  }

  const initialLayout = renderableWidgets.map((widget, index) => ({
    i: widget.id.toString(),
    x: (index % 2) * DEFAULT_WIDGET_WIDTH,
    y: Math.floor(index / 2) * DEFAULT_WIDGET_HEIGHT,
    w: DEFAULT_WIDGET_WIDTH,
    h: DEFAULT_WIDGET_HEIGHT,
    minW: 3,
    minH: 3,
    maxW: 12,
    maxH: 8
  }));

  return (
    <div className="mt-1">
    <ResponsiveGridLayout
      className="layout bg-muted/70 dark:bg-muted/45 p-1 rounded-md"
      key={measurementKey} 
      layouts={{
        lg: initialLayout,
        md: initialLayout,
        sm: initialLayout,
        xs: initialLayout,
        xxs: initialLayout
      }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={65}
      margin={[16, 16]}
      containerPadding={[16, 16]}
      onLayoutChange={onLayoutChange}
      isDraggable
      isResizable
      resizeHandles={['se']}
      draggableHandle=".widget-header"
      compactType="vertical"
      measureBeforeMount={false}
      useCSSTransforms={true}
    >
      {renderableWidgets.map((widget) => (
        <div
          key={`${widget.id.toString()}`}
          className="rounded-lg border border-border/40 shadow-md hover:shadow-lg transition-shadow duration-200 bg-card dark:bg-card/95 h-full backdrop-blur-[2px] hover:border-border/80"
        >
          <Widget widget={widget} />
        </div>
      ))}
    </ResponsiveGridLayout>
    </div>
  );
};

export const DashboardLayout = () => {
  return (
    <div className="p-2 rounded-lg">
      <GridLayout />
    </div>
  );
};
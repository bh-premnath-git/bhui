import { useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Widget } from "./widgets/Widget";
import { useDataOps } from "@/context/dataops/DataOpsContext";
import { LayoutDashboard } from "lucide-react";
import { updateWidgetLayout } from "@/lib/widgetLayout";
import { useLayoutPersistence } from "@/hooks/useLayoutPersistence";
import { applyFilters } from "@/lib/filterUtils";
import { ExecutedQueryItem } from "@/types/dataops/dataops-dash";
import "react-grid-layout/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_STORAGE_KEY = 'dashboard_layout';

export const DashboardLayout = () => {
  const { state } = useDataOps();
  const { widgets, selectedDashboard, filters } = state;

  const { layouts, handleLayoutChange } = useLayoutPersistence({
    storageKey: LAYOUT_STORAGE_KEY,
    dashboard: selectedDashboard
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
      const orderA = orderMap.get(a.widget_id) || 0;
      const orderB = orderMap.get(b.widget_id) || 0;
      return orderA - orderB;
    });
  }, [widgets, selectedDashboard]);

  const filteredWidgets = useMemo(() => {
    return orderedWidgets.map(widget => ({
      ...widget,
      executed_query: applyFilters(widget.executed_query as ExecutedQueryItem[], filters)
    }));
  }, [orderedWidgets, filters]);

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

      await updateWidgetLayout( state.dashboards, selectedDashboard.dashboard_id, updates);
    } catch (error) {
      console.error('Failed to update layout:', error);
    }
  };

  return (
    <div className="p-2 transition-all duration-300">
      {filteredWidgets.length > 0 ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          margin={[8, 8]}
          containerPadding={[0, 0]}
          onLayoutChange={onLayoutChange}
          isDraggable
          isResizable
          resizeHandles={['se']}
          draggableHandle=".widget-header"
          compactType="vertical"
          measureBeforeMount={false}
          useCSSTransforms={true}
          transformScale={1}
        >
          {filteredWidgets.map((widget) => (
            <div 
              key={widget.widget_id.toString()} 
              className="rounded-lg shadow-sm transition-all duration-300"
            >
              <Widget widget={widget} />
            </div>
          ))}
        </ResponsiveGridLayout>
      ) : (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-4 bg-card border rounded-lg">
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
      )}
    </div>
  );
};
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { updateWidgetLayout, updateDashboardLayout } from '@/store/slices/dataops/dashboardSlice'
import { WidgetWrapper } from '@/features/dataops/dashboard/widgets/WidgetWrapper';
import { useCallback, useRef, useEffect } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface DashboardGridProps {
  className?: string;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardLayout =  ({ className }: DashboardGridProps) => {
  const { widgets, isGridLocked, layoutMap } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  
  // Mark initial load as complete after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 1000); // Give RGL time to settle
    
    return () => clearTimeout(timer);
  }, []);

  const layouts = {
    lg: Object.values(widgets).map(widget => ({
      i: widget.id,
      x: widget.layout.x,
      y: widget.layout.y,
      w: widget.layout.w,
      h: widget.layout.h,
      minW: 3,
      minH: 3
    }))
  };

  // Debounced API call function
  const debouncedApiUpdate = useCallback((layoutChanges: Array<{widgetId: string, layout: {x: number, y: number, w: number, h: number}}>) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for API calls
    debounceTimeoutRef.current = setTimeout(() => {
      layoutChanges.forEach(({ widgetId, layout }) => {
        const layoutEntry = layoutMap[widgetId];
        if (layoutEntry?.layout_id) {
          dispatch(updateDashboardLayout({
            layoutId: layoutEntry.layout_id,
            layout
          }));
        }
      });
    }, 500); // 500ms delay after user stops interacting
  }, [dispatch, layoutMap]);

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    if (isGridLocked) return;
    
    // Skip layout changes during initial load to prevent unnecessary API calls
    if (isInitialLoadRef.current) {
      console.log('🔧 Dashboard - Skipping layout change during initial load');
      return;
    }
    
    const layoutChanges: Array<{widgetId: string, layout: {x: number, y: number, w: number, h: number}}> = [];
    let hasActualChanges = false;
    
    layout.forEach(item => {
      const widgetId = item.i;
      const currentWidget = widgets[widgetId];
      
      if (!currentWidget) return;
      
      const newLayout = {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
      };

      // Check if layout actually changed
      const hasChanged = 
        currentWidget.layout.x !== newLayout.x ||
        currentWidget.layout.y !== newLayout.y ||
        currentWidget.layout.w !== newLayout.w ||
        currentWidget.layout.h !== newLayout.h;

      if (hasChanged) {
        hasActualChanges = true;
        
        // Update local state immediately for responsive UI
        dispatch(updateWidgetLayout({
          id: widgetId,
          layout: newLayout
        }));

        // Collect changes for debounced API call
        layoutChanges.push({ widgetId, layout: newLayout });
      }
    });

    // Only trigger debounced API calls if there are actual changes
    if (hasActualChanges && layoutChanges.length > 0) {
      console.log('🔧 Dashboard - Layout changed, triggering debounced API update', layoutChanges);
      debouncedApiUpdate(layoutChanges);
    }
  }, [isGridLocked, dispatch, debouncedApiUpdate, widgets]);

  const widgetTitles: Record<string, string> =  Object.fromEntries(
    Object.entries(widgets).map(([id, { name }]) => [
      `chart-widget-${id}`,
      name,
    ]),
  );
  
  return (
    <div className={className}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        margin={[16, 16]}
        onLayoutChange={handleLayoutChange}
        isDraggable={!isGridLocked}
        isResizable={!isGridLocked}
        useCSSTransforms={true}
        draggableHandle=".widget-drag-handle"
        onResizeStop={() => {
          // Force chart resize after grid resize
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 100);
        }}
      >
        {Object.values(widgets).map(widget => (
          <div key={widget.id} className="widget-grid-item">
            <WidgetWrapper
              widgetId={widget.id}
              title={widgetTitles[`chart-widget-${widget.id}`] || 'Widget'}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
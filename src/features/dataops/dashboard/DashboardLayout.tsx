import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { updateWidgetLayout } from '@/store/slices/dataops/dashboardStore'
import { WidgetWrapper } from '@/features/dataops/dashboard/widgets/WidgetWrapper';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface DashboardGridProps {
  className?: string;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardLayout =  ({ className }: DashboardGridProps) => {
  const { widgets, isGridLocked } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  
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

  const handleLayoutChange = (layout: Layout[]) => {
    if (isGridLocked) return;
    
    layout.forEach(item => {
      dispatch(updateWidgetLayout({
        id: item.i,
        layout: {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        }
      }));
    });
  };

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
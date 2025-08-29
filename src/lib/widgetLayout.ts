import { Dashboard, Widget } from '@/types/dataops/dataops-dash';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function updateWidgetLayout(
    dashboards: Dashboard[],
    dashboardId: number,
    updates: Array<{
      widget_id: number;
      order_index: string;
      widget_coordinates: { x: number; y: number };
      widget_size: { w: number; h: number };
    }>
  ): Promise<Dashboard> {
    await delay(20);
  
    const dashboardIndex = dashboards.findIndex(d => d.dashboard_id === dashboardId);
    if (dashboardIndex === -1) throw new Error('Dashboard not found');
  
    const dashboard = { ...dashboards[dashboardIndex] };
    
    updates.forEach(update => {
      const layoutIndex = dashboard.dashboard_layout.findIndex(
        layout => layout.widget_id === update.widget_id
      );
      
      if (layoutIndex !== -1) {
        dashboard.dashboard_layout[layoutIndex] = {
          ...dashboard.dashboard_layout[layoutIndex],
          order_index: update.order_index,
          widget_coordinates: update.widget_coordinates,
          widget_size: update.widget_size
        };
      }
    });
  
    dashboards[dashboardIndex] = dashboard;
  
    return dashboard;
  }

  const generateFreshData = (widget: Widget): Widget => {
    const executedQuery = widget.executed_query?.map(item => ({
      ...item,
      executed_at: new Date().toISOString()
    }));
    return {
      ...widget,
      executed_query: executedQuery
    };
  };

  export async function fetchWidgetsByIds(widgets: Widget[], widgetIds: number[]): Promise<Widget[]> {
    await delay(50);
    return widgetIds.map(id => {
      const widget = widgets.find(w => w.widget_id === id);
      if (!widget) throw new Error(`Widget with ID ${id} not found`);
      return generateFreshData(widget);
    });
  }
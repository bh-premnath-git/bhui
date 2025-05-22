// A generic row type for executed_query results
export interface ExecutedQueryRow {
    [column: string]: string | number;
  }
  
  // Chart configuration for a widget
  export interface ChartConfig {
    type: string;
    xAxis: string;
    yAxis: string;
    series: string | string[];
    title: string;
    metric: string;
  }
  
  // Layout of a widget within a dashboard
  export interface DashboardLayout {
    layout_id: number;
    dashboard_id: number;
    widget_id: number;
    widget_coordinates: Record<string, any>;
    widget_size: Record<string, any>;
    widget_type: string;
    order_index: string;
    visibility: string;
  }
  
  // Top-level dashboard
  export interface Dashboard {
    dashboard_id: number;
    dashboard_name: string;
    owner: string;
    dashboard_type: string;
    visibility: string;
    meta_data: Record<string, any>;
    dashboard_filters: any[];             // fill in a more specific type if you know your filters
    dashboard_layout: DashboardLayout[];
  }
  
  // Widget definition
  export interface Widget {
    widget_id: number;
    widget_name: string;
    owner: string;
    widget_type: string;
    visibility: string;
    sql_query: string;
    executed_query: ExecutedQueryRow[];
    chart_config: ChartConfig;
    meta_data: Record<string, any>;
    dashboard_layout: DashboardLayout[];  // back-refs to layouts, if you need them here
  }
  
  // If you need root-level arrays
  export type Dashboards = Dashboard[];
  export type DashboardLayouts = DashboardLayout[];
  export type Widgets = Widget[];
  
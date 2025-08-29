export interface DashboardLayout {
  id: number;
  layout_id: number;
  dashboard_id: number;
  widget_id: number;
  widget_coordinates: Record<string, unknown>;
  widget_size: Record<string, unknown>;
  widget_type: string;
  order_index: string;
  visibility: string;
}

export interface Dashboard {
  id: number;
  dashboard_id: number;
  dashboard_name: string;
  owner: string;
  dashboard_type: string;
  visibility: string;
  meta_data: Record<string, unknown>;
  dashboard_filters: unknown[];
  dashboard_layout: DashboardLayout[];
}

export type Dashboards = Dashboard[];

export interface DashboardsResponse {
  dashboards: Dashboard[];
  isLoading: boolean;
  isError: boolean;
  isDashboardLoading: boolean;
}

export interface FilterState {
  projectName: string | null;
  timeRange: string | null;
}

export type TimeRangeOption = 'today' | 'yesterday' | '7days' | '30days' | '90days' | null;
export type ProjectOption = string | null;

export type ChartType = 'line_chart' | 'bar_chart' | 'pie_chart' | 'area_chart' | 'column_chart' | 'grouped_bar_chart' | string;

export interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string;
  series: string | string[];
  title: string;
  metric: string;
}

export interface ExecutedQueryItem {
  project_name: string;
  month_label: string;
  [key: string]: unknown;
}

export interface Widget {
  id: number;
  name: string;
  owner: string;
  widget_type: string;
  visibility: string;
  sql_query: string;
  executed_query: ExecutedQueryItem[] | any;
  plotly_data: string | any;
  intermediate_executed_query_json?: any;
  chart_config: ChartConfig | Record<string, unknown>;
  meta_data: Record<string, unknown>;
  dashboard_layout: unknown[];
}

export interface WidgetsResponse {
  widgets: Widget[];
  isLoading: boolean;
  isError: boolean;
}
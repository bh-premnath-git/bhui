export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'gauge' | 'treemap' | 'histogram' | 'bubble' | 'radar' | 'donut';

export type ChartFormat = 'number' | 'currency' | 'percent';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  data?: QueryResult[];
  isLoading?: boolean;
}

export interface QueryResult {
  type: 'table' | 'chart' | 'sql';
  data: any[] | Record<string, any[]>;
  columns?: string[];
  error?: string;
  chartType?: ChartType;
  title?: string;
  xAxis?: string;
  yAxis?: string;
  xAxisLabel?: string; // Label for x-axis
  yAxisLabel?: string; // Label for y-axis
  sizeKey?: string; // For bubble charts to specify the size dimension
  isMultiSeries?: boolean;
  format?: ChartFormat;
  config?: Record<string, any>;
  min?: number;
  max?: number;
  bins?: number;
}

export interface StreamMessage {
  meta?: {
    version: string;
    timestamp: string;
    request_id: string;
    status: 'started' | 'completed';
  };
  data?: {
    message: string;
    input_question?: string;
    duration_ms?: number;
    results_summary?: {
      response_type: string;
    };
  };
  response_type?: 'IDENTIFY' | 'SQL' | 'TABLE' | 'CHART' | 'EXPLANATION';
  content?: any;
  timestamp?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'postgres' | 'mysql' | 'sqlite';
  tables: TableSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
}

export interface Connection {
  id: string;
  name: string;
}

export interface RecentChat {
  id: string;
  name: string;
}

export interface SavedDashboard {
  id: string;
  name: string;
  content: string;
  data: QueryResult[];
  timestamp: Date;
  connectionId?: string;
}
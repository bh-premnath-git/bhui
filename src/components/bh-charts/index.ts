export * from './LineChart';
export * from './BarChart';
export * from './AreaChart';
export * from './PieChart';
export * from './ScatterChart';
export * from '@/types/dataops/data-ops-hub.d';

export interface LineChartProps {
  data: any[];
  xAxisDataKey: string;
  lines: string[];
  colors?: string[];
}

export interface BarChartProps {
  data: any[];
  xAxisDataKey: string;
  bars: string[];
  colors?: string[];
}

export interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
}
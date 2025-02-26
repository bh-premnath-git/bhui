export * from './LineChart';
export * from './BarChart';
export * from './AreaChart';
export * from './PieChart';
export * from './ScatterChart';
export * from './GaugeChart.tsx';
export * from './TreemapChart.tsx';
export * from './HistogramChart.tsx';
export * from './BubbleChart.tsx';
export * from './RadarChart.tsx';
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

export interface AreaChartProps {
  data: any[];
  xAxisDataKey: string;
  areas: string[];
  colors?: string[];
  stacked?: boolean;
}

export interface ScatterChartProps {
  data: any[];
  xAxisDataKey: string;
  yAxisDataKey: string;
  groups: string[];
  colors?: string[];
}

export interface GaugeChartProps {
  value: number;
  min: number;
  max: number;
  color?: string;
  label?: string;
}

export interface TreemapChartProps {
  data: any[];
  dataKey: string;
  colors?: string[];
}

export interface HistogramChartProps {
  data: number[];
  bins?: number;
  color?: string;
}

export interface BubbleChartProps {
  data: any[];
  xAxisDataKey: string;
  yAxisDataKey: string;
  sizeKey: string;
  groups: string[];
  colors?: string[];
}

export interface RadarChartProps {
  data: any[];
  variables: string[];
  groups: string[];
  colors?: string[];
}
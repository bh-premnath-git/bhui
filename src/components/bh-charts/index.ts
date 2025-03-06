export * from './LineChart';
export * from './BarChart';
export * from './AreaChart';
export * from './PieChart';
export * from './ScatterChart';
export * from './GaugeChart';
export * from './TreemapChart';
export * from './HistogramChart';
export * from './BubbleChart';
export * from './RadarChart';
export * from './DonutChart';
export * from './ChartToolbar';
export * from './ChartTypes';
export * from '@/types/dataops/data-ops-hub.d';

export interface LineChartProps {
  data: any[];
  xAxisDataKey: string;
  lines: string[];
  colors?: string[];
  config?: Record<string, any>;
}

export interface BarChartProps {
  data: any[];
  xAxisDataKey: string;
  bars: string[];
  colors?: string[];
  config?: Record<string, any>;
}

export interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  config?: Record<string, any>;
}

export interface AreaChartProps {
  data: any[];
  xAxisDataKey: string;
  areas: string[];
  colors?: string[];
  stacked?: boolean;
  config?: Record<string, any>;
}

export interface ScatterChartProps {
  data: any[];
  xAxisDataKey: string;
  yAxisDataKey: string;
  groups: string[];
  colors?: string[];
  config?: Record<string, any>;
}

export interface GaugeChartProps {
  value: number | string;
  min?: number;
  max?: number;
  color?: string;
  label?: string;
  config?: Record<string, any>;
}

export interface TreemapChartProps {
  data: any[];
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  config?: Record<string, any>;
  isMultiSeries?: boolean;
}

export interface HistogramChartProps {
  data: Array<number | string>;
  bins?: number;
  color?: string;
  config?: Record<string, any>;
}

export interface BubbleChartProps {
  data: any[];
  xAxisDataKey: string;
  yAxisDataKey: string;
  sizeKey: string;
  groups: string[];
  colors?: string[];
  config?: Record<string, any>;
}

export interface RadarChartProps {
  data: any[];
  variables: string[];
  groups: string[];
  colors?: string[];
  config?: Record<string, any>;
}

export interface DonutChartProps {
  data: Array<{
    name: string;
    value: number | string;
    color?: string;
  }>;
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  config?: Record<string, any>;
}

export interface ChartToolbarProps {
  currentType: string;
  selectedTheme: string;
  vizId?: string;
  onChartTypeChange: (type: string) => void;
  onColorThemeChange: (theme: string) => void;
  onSettingChange?: (setting: string, value: boolean) => void;
  config?: Record<string, any>;
  className?: string;
}
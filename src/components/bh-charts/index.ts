import { interpolateRgb } from "d3-interpolate";

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

export const colorPalettes = {
  blueToGreen: ["#0000FF", "#00FFFF", "#00FF00"],
  colorsOfRainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8F00FF"],
  modernSunset: ["#003f5c", "#58508d", "#bc5090", "#ff6361", "#ffa600"],
  presetSuperset: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"],
  presetColors: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"],
  redToYellow: ["#FF0000", "#FF7F00", "#FFFF00"],
  supersetColors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
};

export function generateColorPalette(numColors: number, palette: keyof typeof colorPalettes = 'supersetColors'): string[] {
  const baseColors = colorPalettes[palette];
  
  if (numColors <= baseColors.length) {
    return baseColors.slice(0, numColors);
  }

  // Generate interpolated colors if we need more colors than the base palette
  const result: string[] = [];
  const interval = (baseColors.length - 1) / (numColors - 1);

  for (let i = 0; i < numColors; i++) {
    const position = i * interval;
    const leftIndex = Math.floor(position);
    const rightIndex = Math.min(leftIndex + 1, baseColors.length - 1);
    const t = position - leftIndex;

    if (leftIndex === rightIndex) {
      result.push(baseColors[leftIndex]);
    } else {
      const interpolator = interpolateRgb(baseColors[leftIndex], baseColors[rightIndex]);
      result.push(interpolator(t));
    }
  }

  return result;
}

export const COLORS = [
  "var(--chart-1-color)",
  "var(--chart-2-color)",
  "var(--chart-3-color)",
  "var(--chart-4-color)",
  "var(--chart-5-color)",
]

export const COLORS_WITH_OPACITY = COLORS.map((color) => ({
  stroke: color,
  fill: `${color}33`,
}))

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
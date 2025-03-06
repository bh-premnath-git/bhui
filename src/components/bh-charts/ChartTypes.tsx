import { BarChart, LineChart, PieChart, CircleDotDashed, AreaChart, Gauge, Circle, BarChartHorizontal, Donut, Radar, Grid3X3 } from 'lucide-react';

// Chart type options with their icons
export const CHART_TYPES = [
  { type: 'bar', icon: BarChart, label: 'Bar Chart' },
  { type: 'line', icon: LineChart, label: 'Line Chart' },
  { type: 'pie', icon: PieChart, label: 'Pie Chart' },
  { type: 'donut', icon: Donut, label: 'Donut Chart' },
  { type: 'scatter', icon: CircleDotDashed, label: 'Scatter Plot' },
  { type: 'area', icon: AreaChart, label: 'Area Chart' },
  { type: 'gauge', icon: Gauge, label: 'Gauge Chart' },
  { type: 'bubble', icon: Circle, label: 'Bubble Chart' },
  { type: 'histogram', icon: BarChartHorizontal, label: 'Histogram' },
  { type: 'radar', icon: Radar, label: 'Radar Chart' },
  { type: 'treemap', icon: Grid3X3, label: 'Treemap Chart' }
];

// Define available color themes
export const COLOR_THEMES = {
  blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#2563EB'],
  green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#059669'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#7C3AED'],
  pink: ['#EC4899', '#F472B6', '#FBCFE8', '#FCE7F3', '#DB2777'],
  orange: ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#EA580C'],
  mixed: ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316']
};

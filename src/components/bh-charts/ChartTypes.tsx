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
  // Default Palette
  default: ['#FF8C42', '#FFE4D6', '#4CAF50', '#FFFFFF', '#4A90E2'],
  alternate: ['#4A90E2', '#FF8C42', '#4CAF50', '#FFE4D6', '#FFFFFF'],
  
  // Vivid Palette
  vivid: ['#20D4BF', '#8B5CF6', '#F43F5E', '#FFBB24', '#22C55E'],
  
  // Neon Palette
  neon: ['#00FFF1', '#7B61FF', '#FF22E3', '#FFFF00', '#00FF00'],
  
  // Ocean Palette
  ocean: ['#0EAAE3', '#22D3EE', '#20D4BF', '#14B8A6', '#0D54B8'],
  
  // Forest Palette
  forest: ['#22C55E', '#84CC16', '#10B981', '#059669', '#047B57'],
  
  // Sunset Palette
  sunset: ['#F97316', '#FB923C', '#EC4899', '#8B5CF6', '#6366F1'],
  
  // Terra Palette
  terra: ['#7B350F', '#B45309', '#92400E', '#A16207', '#854D0E'],
  
  // Corporate Palette
  corporate: ['#647488', '#475569', '#94A3B8', '#CBD5E1', '#FFFFFF'],
  
  // Pastel Palette
  pastel: ['#FDAAAF', '#FCD34D', '#86EFAC', '#93C5FD', '#DDD6FE'],
  
  // Keep existing themes if needed
  blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#2563EB'],
  green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#059669'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#7C3AED'],
  pink: ['#EC4899', '#F472B6', '#FBCFE8', '#FCE7F3', '#DB2777'],
  orange: ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#EA580C'],
  mixed: ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316']
};

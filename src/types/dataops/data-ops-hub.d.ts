import type { ChartType, ColorScheme } from "@/features/data-catalog/components/Xplore/StyleEditor";

export type DataItem = {
  name: string
  project: string
  pipeline: string
  latency: number
  cost: number
  freshness: number
  status: "In Progress" | "Completed" | "Failed" | "Did Not Arrive" | "Not Published"
  date: Date
}

export type FilterOption = "All" | string

export interface CustomizedDotProps {
  cx: number
  cy: number
  stroke: string
  payload?: { name: string; [key: string]: any }
  value?: number
  index?: number
  dataKey?: string
  isShow?: boolean
  key?: string
}

export type ChartData = {
  latency: any[]
  cost: any[]
  freshness: any[]
  ingestion: any[]
  publish: any[]
  health: any[]
  quality: any[]
  incident: any[]
}

export interface ChartStyles {
  chartType: ChartType;
  colorScheme: ColorScheme;
  colors: string[];
}

export interface GenericData {
  [key: string]: string | number;
}

export interface DashboardMetric {
  brand: string;
  value: number;
  trend: string;
  status: 'increase' | 'decrease' | 'stable';
}

export interface DashboardData {
  title: string;
  description: string;
  timeRange: string;
  brands: string[];
  metrics?: DashboardMetric[];
  salesData: GenericData[];
  explanation?: string | string[];
}
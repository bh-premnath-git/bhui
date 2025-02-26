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
  chartType: 'bar' | 'line' | 'pie';
  colorScheme: 'sophisticated' | 'energetic' | 'minimalist' | 'custom';
  colors: string[];
  customColors?: string[];
}

export interface GenericData {
  [key: string]: string | number;
}
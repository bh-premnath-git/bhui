import { LucideIcon } from 'lucide-react';

export interface ToolbarButtonConfig {
  label: string;
  icon: LucideIcon;
  variant: "link" | "default" | "outline" | "destructive" | "secondary" | "ghost";
  onClick: () => void;
}

export interface CustomToolbarConfig {
  buttons: ToolbarButtonConfig[];
}

export interface DataTableToolbarProps<TData> {
  table: TData
}

export interface DataTableProps<TData> {
  data: TData[]
  columns: any[]
  showToolbar?: boolean
}

export type FilterOption = {
  label: string
  value: string
}


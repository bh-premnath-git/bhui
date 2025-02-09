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
  useStatusCard?: boolean
}

export type FilterOption = {
  label: string
  value: string
}

export interface StatsData {
  success: number
  failed: number
  inProgress: number
}

export interface StatsCardsProps {
data: StatsData
selectedStatuses: string[]
onStatusSelect: (status: string) => void
}

import type { ColumnDef, FilterFn, Table } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

interface DropdownItem {
  label: React.ReactNode;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

// Button configuration for toolbar
interface ToolbarButtonConfig {
  label: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  dropdownItems?: DropdownItem[]; 
}

// Generic toolbar configuration
export interface TToolbarConfig<T = any> {
  buttons?: ToolbarButtonConfig[];
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
  customContent?: React.ReactNode;
  className?: string;
}

// Header button configuration for column headers
interface HeaderButtonConfig {
  icon: LucideIcon;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

// Generic column definition with filtering capabilities
export type ColumnDefWithFilters<T> = ColumnDef<T> & {
  enableColumnFilter?: boolean;
  filterFn?: FilterFn<T> | string;
  headerButton?: HeaderButtonConfig;
}

export interface TopSectionProps<TData> {
  table: Table<TData>;
  toolbarConfig?: TToolbarConfig;
  headerFilter?: string;
  importSrcFn?: () => void;
  fullData?: TData[];
  showSearch?: boolean; // allow hiding the global search input
}

export interface StatusMetric {
  label: string;
  value: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
  filterValue: string;
}
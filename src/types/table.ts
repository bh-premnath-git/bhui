import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

// Button configuration for toolbar
interface ToolbarButtonConfig {
  label: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

// Generic toolbar configuration
export interface TToolbarConfig<T = any> {
  buttons?: ToolbarButtonConfig[];
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
  customContent?: React.ReactNode;
  className?: string;
}

// Generic column definition with filtering capabilities
export type ColumnDefWithFilters<T> = ColumnDef<T> & {
  enableColumnFilter?: boolean;
  filterFn?: FilterFn<T> | string;
}
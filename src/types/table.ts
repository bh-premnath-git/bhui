import type React from "react"
import type { ColumnDef, Row, Table } from "@tanstack/react-table"
import type { LucideIcon } from "lucide-react"

export interface TToolbarButton {
  label: string | React.ReactNode
  icon: LucideIcon
  variant: "link" | "default" | "outline" | "destructive" | "secondary" | "ghost"
  onClick: () => void
}

export interface TToolbarConfig {
  buttons: TToolbarButton[]
}

export interface TopSectionProps<TData> {
  table: Table<TData>
  toolbarConfig: TToolbarConfig
}

export interface HeaderButton {
  icon: LucideIcon
  onClick: () => void
  tooltip: string
}

export type ColumnDefWithFilters<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableColumnFilter?: boolean
  headerButton?: HeaderButton
}

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDefWithFilters<TData, any>[]
  topVariant?: "simple" | "status"
  pagination?: boolean
  toolbarConfig?: TToolbarConfig
  onRowClick?: (row: Row<TData>) => void
}

export interface StatusMetric {
  label: string
  value: number
  percentage: number
  icon: React.ReactNode
  color: string
}
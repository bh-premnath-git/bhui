export type Status = "success" | "failed" | "in-progress"

export interface TableData {
  id: string
  [key: string]: any
}

export interface Column {
  id: string
  header: string
  accessorKey: string
  enableSorting?: boolean
  enableFiltering?: boolean
  cell?: (props: any) => JSX.Element
}
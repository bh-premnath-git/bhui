import React, { useEffect } from "react"
import { 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel, 
  useReactTable,
  type Row 
} from "@tanstack/react-table"
import { SimpleTopSection } from "./simple-top-section"
import { StatusTopSection } from "./status-top-section"
import { TableContent } from "./table-content"
import { TablePagination } from "./table-pagination"

// Define DataTableProps since the import isn't working
export interface DataTableProps<TData> {
  data: TData[]
  columns: any[]
  topVariant?: "simple" | "status"
  headerFilter?: any
  pagination?: boolean
  toolbarConfig?: any
  onRowClick?: (row: Row<TData>) => void
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  importSrcFn?: () => void
  fullData?: TData[]
}

export function DataTable<TData>({
  data,
  columns,
  topVariant = "simple",
  headerFilter,
  pagination = true,
  toolbarConfig,
  onRowClick,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  importSrcFn,
  fullData
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = React.useState<any[]>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [isInitialized, setIsInitialized] = React.useState(false)

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: pageIndex !== undefined ? pageIndex : 0,
        pageSize: pageSize !== undefined ? pageSize : 10,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    pageCount,
    manualPagination: pageCount !== undefined,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const oldState = {
          pageIndex: pageIndex || 0,
          pageSize: pageSize || 10,
        };
        const newState = updater(oldState);
        
        if (onPageChange && newState.pageIndex !== oldState.pageIndex) {
          onPageChange(newState.pageIndex + 1);
        }
        
        if (onPageSizeChange && newState.pageSize !== oldState.pageSize) {
          onPageSizeChange(newState.pageSize);
        }
      }
    },
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  useEffect(() => {
    if (!isInitialized && table) {
      setIsInitialized(true)
    }
  }, [table, isInitialized])

  if (!isInitialized || !table) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {topVariant === "simple" ? (
        <SimpleTopSection table={table} toolbarConfig={toolbarConfig} importSrcFn={importSrcFn} />
      ) : (
        <StatusTopSection 
          table={table} 
          toolbarConfig={toolbarConfig} 
          headerFilter={headerFilter}
          fullData={fullData}
        />
      )}

      <TableContent 
        table={table} 
        onRowClick={onRowClick}
      />

      {pagination && <TablePagination table={table} />}
    </div>
  );
}
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
  fullData?: TData[]
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  showSearch?: boolean // show or hide the global search input in top section
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
  fullData,
  hasNextPage,
  hasPreviousPage,
  showSearch = true
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
          onPageChange(newState.pageIndex);
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

  // Update the table when page index changes
  useEffect(() => {
    if (table) {
      table.setPageIndex(pageIndex !== undefined ? pageIndex : 0);
    }
  }, [table, pageIndex]);

  useEffect(() => {
    if (!isInitialized && table) {
      setIsInitialized(true)
    }
  }, [table, isInitialized])

  if (!isInitialized || !table) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4 w-full">
      {topVariant === "simple" ? (
        <SimpleTopSection table={table} toolbarConfig={toolbarConfig} showSearch={showSearch} />
      ) : (
        <StatusTopSection 
          table={table} 
          toolbarConfig={toolbarConfig} 
          headerFilter={headerFilter}
          fullData={fullData}
          showSearch={showSearch}
        />
      )}

      <div className="relative w-full  [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
        <div style={{ minWidth: '100%' }}>
          <TableContent 
            table={table} 
            onRowClick={onRowClick}
          />
        </div>
      </div>

      {pagination && <TablePagination 
        table={table} 
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />}
    </div>
  );
}
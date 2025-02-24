import React, { useEffect } from "react"
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import { SimpleTopSection } from "./simple-top-section"
import { StatusTopSection } from "./status-top-section"
import { TableContent } from "./table-content"
import { TablePagination } from "./table-pagination"
import type { DataTableProps } from "@/types/table"

export function DataTable<TData>({
  data,
  columns,
  topVariant = "simple",
  headerFilter,
  pagination = true,
  toolbarConfig,
  onRowClick,
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
    },
    enableFilters: true,
    enableColumnFilters: true,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        <SimpleTopSection table={table} toolbarConfig={toolbarConfig} />
      ) : (
        <StatusTopSection table={table} toolbarConfig={toolbarConfig} headerFilter={headerFilter} />
      )}

      <TableContent table={table} onRowClick={onRowClick} />

      {pagination && <TablePagination table={table} />}
    </div>
  );
}
import type { Table } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} (
          {table.getFilteredRowModel().rows.length} items)
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Select
        value={`${table.getState().pagination.pageSize}`}
        onValueChange={(value) => {
          table.setPageSize(Number(value))
        }}
      >
        <SelectTrigger className="h-8 w-[110px]">
          {/* Using “text-foreground” so it adapts automatically */}
          <SelectValue className="text-foreground">
            {table.getState().pagination.pageSize} per page
          </SelectValue>
        </SelectTrigger>
        <SelectContent side="top">
          {[5, 10, 20, 30].map((pageSize) => (
            <SelectItem key={pageSize} value={`${pageSize}`}>
              {pageSize} per page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

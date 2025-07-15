import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TablePaginationProps<TData> {
  table: Table<TData>
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function TablePagination<TData>({ 
  table, 
  hasNextPage, 
  hasPreviousPage 
}: TablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost" 
          size="icon" 
          onClick={() => table.previousPage()}
          disabled={hasPreviousPage === undefined ? !table.getCanPreviousPage() : !hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} (
          {table.getFilteredRowModel().rows.length} items)
        </span>
        <Button
          variant="ghost" 
          size="icon" 
          onClick={() => table.nextPage()}
          disabled={hasNextPage === undefined ? !table.getCanNextPage() : !hasNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Select
        value={table.getState().pagination.pageSize.toString()}
        onValueChange={(value) => {
          table.setPageSize(Number(value))
        }}
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder={`${table.getState().pagination.pageSize} per...`} />
        </SelectTrigger>
        <SelectContent style={{zIndex:99999}}>
          {[10, 15, 20].map((pageSize) => (
            <SelectItem key={pageSize} value={pageSize.toString()}>
              {pageSize} per page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

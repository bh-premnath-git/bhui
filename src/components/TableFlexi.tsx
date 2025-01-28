import {useState, useCallback} from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronsUpDown, Filter, PlusCircle } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableFlexiPagination } from "./TableFlexiPagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onFilterClick: () => void
  playRow?: boolean;
  playRowFn?: (rowData: any) => void
  tableName?: string;
  clickXploreFn?: () => void;
}

const SHOWONL_XPLORER = ["dataopshubb"];


export function TableFlexi<TData, TValue>({
  columns,
  data,
  onFilterClick,
  playRow = false,
  playRowFn,
  tableName,
  clickXploreFn
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  const handleClickXplore = useCallback(() => {
    if (clickXploreFn) clickXploreFn();
  }, [clickXploreFn]);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end mb-2 gap-2">
        <div className="relative w-54">
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 py-1 text-sm h-8 w-full"
          />
        </div>
        {!SHOWONL_XPLORER.includes(tableName) && <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onFilterClick}
        >
          <Filter className="h-4 w-4" />
          <span className="sr-only">Open filter dialog</span>
        </Button>}

        {tableName && SHOWONL_XPLORER.includes(tableName) && (
            <Button
              variant="default"
              className={cn(
                SHOWONL_XPLORER.includes(tableName)
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : ``
              )}
              onClick={handleClickXplore}
              aria-label={`Explorer${tableName}`}
            >
              Xplore <PlusCircle className="ml-2 h-4 w-4" />
            </Button>
          )}

      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ChevronsUpDown
                              className="h-4 w-4 cursor-pointer"
                              onClick={() => header.column.toggleSorting()}
                            />
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    if (playRow && playRowFn) {
                      playRowFn(row.original)
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TableFlexiPagination table={table} />
    </div>
  )
}

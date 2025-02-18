import type { Row, Table } from "@tanstack/react-table"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender } from "@tanstack/react-table"

interface TableContentProps<TData> {
  table: Table<TData>
  onRowClick?: (row: Row<TData>) => void
}

export function TableContent<TData>({ table, onRowClick }: TableContentProps<TData>) {
  return (
    <div className="rounded-md border">
      <UITable>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold text-muted-foreground">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow key={row.id}
                className={`${index % 2 === 0 ? "bg-background" : "bg-muted/50"} ${onRowClick ? "cursor-pointer hover:bg-muted" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UITable>
    </div>
  )
}
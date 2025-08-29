import type { Table, Row } from "@tanstack/react-table"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ColumnDefWithFilters } from "@/types/table"
import React from "react"

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
                  <div className="flex items-center gap-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {(header.column.columnDef as ColumnDefWithFilters<TData>).headerButton && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={(header.column.columnDef as ColumnDefWithFilters<TData>).headerButton?.onClick}
                            >
                              {React.createElement(
                                (header.column.columnDef as ColumnDefWithFilters<TData>).headerButton!.icon,
                                { className: "h-4 w-4" },
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {(header.column.columnDef as ColumnDefWithFilters<TData>).headerButton?.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                className={`${index % 2 === 0 ? "bg-background" : "bg-muted/50"} ${onRowClick ? "cursor-pointer hover:bg-muted" : ""}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-2 px-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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


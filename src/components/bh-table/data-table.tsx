import { useState, useMemo, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
  type FilterFn,
  type Row,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { DataTableProps, CustomToolbarConfig } from "@/types/data-table.types";

// Fuzzy filter function for searching
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  showToolbar = true,
  useStatusCard = false,
  tableName,
  customToolbarConfig,
  onRowClick,
}: DataTableProps<TData> & {
  tableName?: string;
  customToolbarConfig?: CustomToolbarConfig;
  onRowClick?: (row: Row<TData>) => void;
}) {
  // Table filtering state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Memoized columns and data for react-table
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  // Initialize the table
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    state: {
      columnFilters,
      globalFilter,
    },
  });

  // Reference to the scroll container
  const parentRef = useRef<HTMLDivElement>(null);

  // Initialize the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // estimated row height
  });

  // Compute spacer heights to reserve space for non-rendered rows
  const virtualItems = rowVirtualizer.getVirtualItems();
  const topSpacerHeight = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const bottomSpacerHeight =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <div className="space-y-4">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          tableName={tableName}
          customToolbarConfig={customToolbarConfig}
        />
      )}

      <div ref={parentRef} className="rounded-md border overflow-y-auto max-h-[600px]">
        <Table>
          {/* Sticky header */}
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* Top spacer row */}
            {topSpacerHeight > 0 && (
              <TableRow style={{ height: `${topSpacerHeight}px` }} className="bg-transparent">
                <TableCell colSpan={columns.length} />
              </TableRow>
            )}

            {/* Render virtualized rows */}
            {virtualItems.length ? (
              virtualItems.map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={clsx(
                      virtualRow.index % 2 === 0 ? "bg-background" : "bg-muted/50",
                      onRowClick && "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={(event) => {
                      event.preventDefault();
                      onRowClick && onRowClick(row);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              // Fallback row if no data is present
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}

            {/* Bottom spacer row */}
            {bottomSpacerHeight > 0 && (
              <TableRow style={{ height: `${bottomSpacerHeight}px` }} className="bg-transparent">
                <TableCell colSpan={columns.length} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

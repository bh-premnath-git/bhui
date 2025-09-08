import React from 'react';
import type { TableEvent } from '@/types/streaming';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const DataTable: React.FC<{ table: TableEvent['content'] }> = ({ table }) => {
  const getCellAlignment = (cell: unknown): string => {
    if (typeof cell === 'number') return 'text-right';
    if (typeof cell === 'boolean') return 'text-center';
    return 'text-left';
  };

  const getHeaderAlignment = (columnValues: unknown[][], colIdx: number): string => {
    const firstValue = columnValues.find(row => row[colIdx] != null)?.[colIdx];
    return getCellAlignment(firstValue);
  };

  const formatCellValue = (cell: unknown): React.ReactNode => {
    if (cell === null || cell === undefined) {
      return <span className="text-muted-foreground/70">—</span>;
    }
    if (typeof cell === 'boolean') {
      return (
        <span
          className={cn(
            'inline-flex items-center justify-center w-5 h-5 rounded-full',
            cell ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
          )}
        >
          {cell ? '✓' : '✗'}
        </span>
      );
    }
    if (typeof cell === 'number') {
      return (
        <span className="font-mono text-sm font-medium">
          {Number.isInteger(cell) ? cell.toLocaleString() : cell.toFixed(2)}
        </span>
      );
    }
    return String(cell);
  };

  return (
    <div className="w-full space-y-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="relative overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
              <TableRow className="hover:bg-transparent">
                {table.column_names.map((column, idx) => (
                  <TableHead
                    key={idx}
                    className={cn(
                      'whitespace-nowrap font-semibold text-foreground/90',
                      getHeaderAlignment(table.column_values, idx)
                    )}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.column_values.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className={cn(
                    'group transition-colors',
                    'hover:bg-muted/50',
                    rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/5'
                  )}
                >
                  {row.map((cell, cellIdx) => (
                    <TableCell
                      key={cellIdx}
                      className={cn(
                        'py-3 px-4 text-sm',
                        'border-t border-border/20',
                        'group-hover:bg-muted/20',
                        getCellAlignment(cell)
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {formatCellValue(cell)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{table.column_values.length}</span>
            <span>rows</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{table.column_names.length}</span>
            <span>columns</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground/70">
          Showing {table.column_values.length} of {table.metadata?.total_rows || table.column_values.length} records
        </div>
      </div>
    </div>
  );
};

export { DataTable };
import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "use-debounce";
import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { CustomToolbarConfig } from "@/types/data-table.types";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableStatusFilter } from "./data-filter-status-card";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  tableName?: string;
  customToolbarConfig?: CustomToolbarConfig;
  useStatusCard?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  tableName,
  useStatusCard = false,
  customToolbarConfig,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter !== "";

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  useEffect(() => {
    table.setGlobalFilter(debouncedSearchValue);
  }, [debouncedSearchValue, table]);

  const handleReset = useCallback(() => {
    table.resetColumnFilters();
    table.setGlobalFilter("");
    setSearchValue("");
  }, [table]);

  if (useStatusCard) {
    return (
      <DataTableStatusFilter
        data={{
          success: table.getPreFilteredRowModel().rows.filter((row) => row.getValue("status") === "success").length,
          failed: table.getPreFilteredRowModel().rows.filter((row) => row.getValue("status") === "failed").length,
          inProgress: table.getPreFilteredRowModel().rows.filter((row) => row.getValue("status") === "in progress").length,
        }}
        selectedStatuses={(table.getColumn("status")?.getFilterValue() as string[]) || []}
        onStatusSelect={(status: string) => {
          const currentFilters = (table.getColumn("status")?.getFilterValue() as string[]) || [];
          if (currentFilters.includes(status)) {
            table.getColumn("status")?.setFilterValue(currentFilters.filter((s: string) => s !== status));
          } else {
            table.getColumn("status")?.setFilterValue([...currentFilters, status]);
          }
        }}
      />
    );
  }
  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex flex-1 items-center space-x-2">
        {table.getHeaderGroups().map((headerGroup) =>
          headerGroup.headers.map((header) => {
            const column = header.column;
            if (!column.getCanFilter()) return null;
            const options = (column.columnDef as any).filterOptions;
            const title =
              typeof column.columnDef.header === "string"
                ? column.columnDef.header
                : column.id;
            return options ? (
              <DataTableFacetedFilter
                key={column.id}
                column={column}
                title={title}
                options={options}
              />
            ) : null;
          })
        )}

        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-8 w-[120px] lg:w-[150px]"
        />
        {isFiltered && (
          <Button variant="ghost" onClick={handleReset} className="h-8 px-2 lg:px-3">
            Reset
            <RotateCcw className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {customToolbarConfig?.buttons?.map((item, index) => (
          <Button key={index} variant={item.variant} className="h-8" onClick={item.onClick}>
            {<item.icon />}
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

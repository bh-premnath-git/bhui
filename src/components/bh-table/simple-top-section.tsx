import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "./data-table-faceted-filter.tsx"
import type { TopSectionProps, ColumnDefWithFilters } from "@/types/table"
import { getUniqueValues } from "@/lib/utils"

export function SimpleTopSection<TData>({ table, toolbarConfig }: TopSectionProps<TData>) {
  const data = table.getCoreRowModel().rows.map((row) => row.original)
  const columns = table.getAllColumns()

  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-2">
        {columns.map((column) => {
          if (column.getCanFilter() && (column.columnDef as ColumnDefWithFilters<TData>).enableColumnFilter) {
            const options = getUniqueValues(data, column.id)
            return <DataTableFacetedFilter key={column.id} column={column} title={column.id} header={column.columnDef.header as string} options={options} />
          }
          return null
        })}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search..."
          className="w-[200px]"
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
        />
        {toolbarConfig?.buttons && toolbarConfig?.buttons.map((button, index) => (
          <Button key={index} variant={button.variant} onClick={button.onClick}>
            {button.icon && <button.icon className="mr-2 h-4 w-4" />}
            {typeof button.label === "string" ? button.label : <>{button.label}</>}
          </Button>
        ))}
      </div>
    </div>
  )
}
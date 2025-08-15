import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "./data-table-faceted-filter.tsx"
import type { TopSectionProps, ColumnDefWithFilters } from "@/types/table"
import { getUniqueValues } from "@/lib/utils"
import { X, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export function SimpleTopSection<TData>({ table, toolbarConfig, showSearch = true}: TopSectionProps<TData>) {
  const data = table.getCoreRowModel().rows.map((row) => row.original)
  const columns = table.getAllColumns()
  const hasFilters = table.getState().columnFilters.length > 0 || table.getState().globalFilter

  const handleClearFilters = () => {
    table.resetColumnFilters()
    table.setGlobalFilter("")
  }

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
        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showSearch && (
          <Input
            placeholder="Search..."
            className="w-[200px]"
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
          />
        )}
        {toolbarConfig?.buttons && toolbarConfig?.buttons.map((button, index) => {
          if (button.dropdownItems && button.dropdownItems.length > 0) {
            // Render dropdown button
            return (
              <DropdownMenu key={index}>
                <DropdownMenuTrigger asChild>
                  <Button variant={button.variant} className={button.className} disabled={button.disabled}>
                    {button.icon && <button.icon className="mr-2 h-4 w-4" />}
                    {typeof button.label === "string" ? button.label : <>{button.label}</>}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {button.dropdownItems.map((item, itemIndex) => (
                    <DropdownMenuItem 
                      key={itemIndex} 
                      onClick={item.onClick}
                      disabled={item.disabled}
                      className={item.className}
                    >
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {typeof item.label === "string" ? item.label : <>{item.label}</>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          } else {
            // Render regular button
            return (
              <Button 
                key={index} 
                variant={button.variant} 
                onClick={button.onClick}
                disabled={button.disabled}
                className={button.className}
              >
                {button.icon && <button.icon className="mr-2 h-4 w-4" />}
                {typeof button.label === "string" ? button.label : <>{button.label}</>}
              </Button>
            )
          }
        })}
      </div>
    </div>
  )
}
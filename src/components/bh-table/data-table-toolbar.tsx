import type { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RotateCcw } from "lucide-react"
import { CustomToolbarConfig } from "@/types/data-table.types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  tableName?: string
  customToolbarConfig?: CustomToolbarConfig
}

export function DataTableToolbar<TData>({
  table,
  tableName,
  customToolbarConfig,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter !== ""

  const handleReset = () => {
    table.resetColumnFilters()
    table.setGlobalFilter("")
  }

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex flex-1 items-center space-x-2">
        {table.getHeaderGroups().map((headerGroup) =>
          headerGroup.headers.map((header) => {
            const column = header.column
            if (!column.getCanFilter()) return null
            const options = (column.columnDef as any).filterOptions
            return options ? (
              <DataTableFacetedFilter
                key={column.id}
                column={column}
                title={column.id}
                options={options}
              />
            ) : null
          })
        )}
        <Input
          placeholder="Search..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
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
        {customToolbarConfig &&
          customToolbarConfig.buttons?.map((item, index) => (
            <Button key={index} variant={item.variant} className="h-8" onClick={item.onClick}>
              {<item.icon />}
              {item.label}
            </Button>
          ))}
      </div>
    </div>
  )
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column: any
  title: string
  options: {
    label: string
    value: string
  }[]
}

function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  return (
    <Select
      onValueChange={(value) => {
        if (selectedValues.has(value)) {
          selectedValues.delete(value)
        } else {
          selectedValues.add(value)
        }
        const filterValues = Array.from(selectedValues)
        column?.setFilterValue(filterValues.length ? filterValues : undefined)
      }}
    >
      <SelectTrigger className="h-8 w-[120px] lg:w-[140px]">
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

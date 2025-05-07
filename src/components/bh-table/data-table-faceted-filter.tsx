import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableFacetedFilterProps<TData, TValue> {
  column: any
  title: string
  header: string
  options: {
    label: string
    value: string
  }[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  header,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  // Assume the filter value is stored as an array.
  // For single-select behavior, we consider only the first element.
  const currentFilterValue = (column?.getFilterValue() as string[]) || []
  const currentValue = currentFilterValue[0] || ""

  const handleValueChange = (value: string) => {
    // Toggle the filter:
    // If the same value is selected again, clear the filter.
    if (value === currentValue) {
      column?.setFilterValue([])
    } else {
      column?.setFilterValue([value])
    }
  }

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className="h-8 w-[120px] lg:w-[140px]">
        <SelectValue placeholder={header} />
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


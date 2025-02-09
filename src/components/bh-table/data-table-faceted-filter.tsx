import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DataTableFacetedFilterProps<TData, TValue> {
    column: any
    title: string
    options: {
        label: string
        value: string
    }[]
}

export function DataTableFacetedFilter<TData, TValue>({
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

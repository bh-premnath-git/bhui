import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { FilterOption } from "@/types/dataops/data-ops-hub.d"
import { useFilters } from "@/hooks/useFilter"

interface FilterSelectProps {
  label: string
  value: FilterOption
  onChange: (value: FilterOption) => void
  options: string[]
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, onChange, options }) => (
  <div>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={`${label.toLowerCase()}-select`} className="w-[130px] text-accent-foreground">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option === "All" ? `${label}/All` : `(${option})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

export const Filters: React.FC = () => {
  const { filters, handleFilterChange, resetFilters } = useFilters()

  return (
    <div className="flex flex-wrap items-end gap-2">
      <FilterSelect
        label="Project"
        value={filters.project}
        onChange={(value) => handleFilterChange("project", value)}
        options={["All", "Project1", "Project2", "Project3", "Project4"]}
      />
      <FilterSelect
        label="Pipeline"
        value={filters.pipeline}
        onChange={(value) => handleFilterChange("pipeline", value)}
        options={["All", "Pipeline1", "Pipeline2", "Pipeline3", "Pipeline4"]}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(value) => handleFilterChange("status", value)}
        options={["All", "In Progress", "Completed", "Failed", "Not Published"]}
      />
      <FilterSelect
        label="Duration"
        value={filters.duration}
        onChange={(value) => handleFilterChange("duration", value)}
        options={["All", "Today", "This Week", "This Month"]}
      />
      <Button variant="ghost" size="icon" onClick={resetFilters} aria-label="Reset filters">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
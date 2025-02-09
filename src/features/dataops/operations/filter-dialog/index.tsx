import * as React from "react"
import { useId } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/dayeformat"
import { CalendarIcon } from 'lucide-react'
import { FilterValues, FilterOption } from "@/types/dataops.types"

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyFilters: (filters: FilterValues) => void
  filterOptions: {
    projectOptions: FilterOption[]
    flowOptions: FilterOption[]
    statusOptions: FilterOption[]
  }
}

export function TableFiexiFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  filterOptions,
}: FilterDialogProps) {
  const [filters, setFilters] = React.useState<FilterValues>({
    project: "",
    flow: "",
    status: "",
    startDate: undefined,
    endDate: undefined,
  })

  const handleFilterChange = React.useCallback((key: keyof FilterValues, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = React.useCallback(() => {
    setFilters({
      project: "",
      flow: "",
      status: "",
      startDate: undefined,
      endDate: undefined,
    })
  }, [])

  const descriptionId = useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-4" aria-describedby={descriptionId}>
        <span id={descriptionId} className="sr-only">
          Filter dialog to refine table data based on project, flow, status, and date range
        </span>
        <DialogHeader className="px-0">
          <DialogTitle>Filter</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-3">
          <div className="space-y-1.5">
            <label htmlFor="project-select" className="text-xs font-medium">Project</label>
            <Select
              value={filters.project}
              onValueChange={(value) => handleFilterChange("project", value)}
            >
              <SelectTrigger id="project-select" className="h-8">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.projectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="flow-select" className="text-xs font-medium">Flow</label>
            <Select
              value={filters.flow}
              onValueChange={(value) => handleFilterChange("flow", value)}
            >
              <SelectTrigger id="flow-select" className="h-8">
                <SelectValue placeholder="Select Flow" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.flowOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="status-select" className="text-xs font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status-select" className="h-8">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="start-date" className="text-xs font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left text-xs h-8",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {filters.startDate ? formatDate(filters.startDate, "PP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => handleFilterChange("startDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="end-date" className="text-xs font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left text-xs h-8",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {filters.endDate ? formatDate(filters.endDate, "PP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => handleFilterChange("endDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetFilters}
          >
            Reset
          </Button>
          <Button 
            size="sm"
            className="bg-[#0b061a] hover:bg-[#0b061a]/90 text-white"
            onClick={() => {
              onApplyFilters(filters)
              onOpenChange(false)
            }}
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

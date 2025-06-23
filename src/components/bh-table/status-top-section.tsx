import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, XCircle, X, ChevronDown } from "lucide-react"
import type { TopSectionProps, StatusMetric } from "@/types/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export function StatusTopSection<TData>({ table, toolbarConfig, headerFilter="status", fullData }: TopSectionProps<TData>) {
  const statusColumn = table.getColumn(headerFilter)
  const selectedStatuses = (statusColumn?.getFilterValue() as string[]) || []

  const metrics: StatusMetric[] = React.useMemo(() => {
    const statusCounts = new Map<string, number>()
    const totalRows = fullData?.length || 0
    
    // This ensures we see ALL possible statuses across ALL pages
    fullData?.forEach((row) => {
      const status = (row as any).flow_status as string
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
    })
    
    return Array.from(statusCounts.entries()).map(([status, count]) => {
      const percentage = (count / totalRows) * 100
      let icon: React.ReactNode
      let color: string

      switch (status) {
        case "Success":
          icon = <CheckCircle2 className="h-3 w-3 text-green-600" />
          color = "green"
          break
        case "Failed":
          icon = <XCircle className="h-3 w-3 text-red-600" />
          color = "red"
          break
        case "In Progress":
          icon = <Clock className="h-3 w-3 text-orange-600" />
          color = "orange"
          break
        default:
          icon = <CheckCircle2 className="h-3 w-3 text-blue-600" />
          color = "blue"
      }

      return {
        label: status,
        value: count,
        percentage,
        icon,
        color,
        filterValue: status
      }
    })
  }, [fullData, headerFilter])

  const handleStatusFilter = (status: string) => {
    if (statusColumn) {
      // Update the filter value while preserving multi-select functionality
      const currentFilters = statusColumn.getFilterValue() as string[] || []
      const updatedStatuses = currentFilters.includes(status)
        ? currentFilters.filter(s => s !== status)
        : [...currentFilters, status]
      
      console.log('Setting filter:', updatedStatuses)
      statusColumn.setFilterValue(updatedStatuses.length ? updatedStatuses : undefined)
    }
  }

  return (
    <div className="flex justify-between items-start gap-4">
      <div className="grid grid-cols-4 gap-2">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className={`cursor-pointer transition-all hover:bg-accent relative ${
              (statusColumn?.getFilterValue() as string[] || []).includes(metric.label) 
                ? `ring-1 ring-${metric.color}-500` 
                : ""
            }`}
            onClick={() => handleStatusFilter(metric.label)}
          >
            {(statusColumn?.getFilterValue() as string[] || []).includes(metric.label) && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusFilter(metric.label)
                }}
              >
                <X className="h-2 w-2" />
              </Button>
            )}
            <CardContent className="flex items-center gap-1.5 p-2">
              <div className={`rounded-full p-1 bg-${metric.color}-100`}>{metric.icon}</div>
              <div className="min-w-0 flex-grow">
                <p className="text-xs font-medium capitalize truncate">{metric.label}</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm font-bold">{metric.value}</span>
                  <span className="text-[10px] text-muted-foreground">{metric.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search..."
          className="w-[200px]"
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
        />
        {toolbarConfig?.buttons && toolbarConfig?.buttons.map((button, index) => {
          if (button.dropdownItems && button.dropdownItems.length > 0) {
            // Render dropdown button
            return (
              <DropdownMenu key={index}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={button.variant} 
                    className={button.className} 
                    disabled={button.disabled}
                  >
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


import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, XCircle, X } from "lucide-react"
import type { TopSectionProps, StatusMetric } from "@/types/table"

export function StatusTopSection<TData>({ table, toolbarConfig, headerFilter="status" }: TopSectionProps<TData>) {
  const allRows = table.getCoreRowModel().rows
  const statusColumn = table.getColumn(headerFilter)
  const selectedStatuses = (statusColumn?.getFilterValue() as string[]) || []
  const metrics: StatusMetric[] = React.useMemo(() => {
    const statusCounts = new Map<string, number>()
    const totalRows = allRows.length
    allRows.forEach((row) => {
      const status = row.getValue(headerFilter) as string
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
    })
    return Array.from(statusCounts.entries()).map(([status, count]) => {
      const percentage = (count / totalRows) * 100
      let icon: React.ReactNode
      let color: string

      switch (status.toLowerCase()) {
        case "success":
          icon = <CheckCircle2 className="h-3 w-3 text-green-600" />
          color = "green"
          break
        case "failed":
          icon = <XCircle className="h-3 w-3 text-red-600" />
          color = "red"
          break
        case "in-progress":
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
      }
    })
  }, [allRows])

  const handleStatusFilter = (status: string) => {
    if (statusColumn) {
      const updatedStatuses = selectedStatuses.includes(status)
        ? selectedStatuses.filter((s) => s !== status)
        : [...selectedStatuses, status]
      statusColumn.setFilterValue(updatedStatuses.length ? updatedStatuses : undefined)
    }
  }

  return (
    <div className="flex justify-between items-start gap-4">
      <div className="grid grid-cols-4 gap-2">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className={`cursor-pointer transition-all hover:bg-accent relative ${selectedStatuses.includes(metric.label) ? `ring-1 ring-${metric.color}-500` : ""
              }`}
            onClick={() => handleStatusFilter(metric.label)}
          >
            {selectedStatuses.includes(metric.label) && (
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


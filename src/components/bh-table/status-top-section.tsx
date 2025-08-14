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

export function StatusTopSection<TData>({ table, toolbarConfig, headerFilter="status", fullData, showSearch = true }: TopSectionProps<TData>) {
  const statusColumn = table.getColumn(headerFilter)

  const metrics = React.useMemo(() => {
    const statusCounts = new Map<string, { count: number, originalStatuses: Set<string> }>()
    const totalRows = fullData?.length || 0

    const getCanonicalStatus = (status: string): string => {
      if (!status) return "Unknown";
      const s = status.toLowerCase().replace(/_/g, ' ');
      if (s.includes('success')) return 'Success';
      if (s.includes('failed') || s.includes('failure')) return 'Failed';
      if (s.includes('progress')) return 'In Progress';
      return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    fullData?.forEach((row) => {
      const originalStatus = (row as any).flow_status as string
      if (originalStatus === null || originalStatus === undefined) return;

      const canonicalStatus = getCanonicalStatus(originalStatus);
      
      if (!statusCounts.has(canonicalStatus)) {
        statusCounts.set(canonicalStatus, { count: 0, originalStatuses: new Set() });
      }
      const statusInfo = statusCounts.get(canonicalStatus)!;
      statusInfo.count += 1;
      statusInfo.originalStatuses.add(originalStatus);
    })
    
    return Array.from(statusCounts.entries()).map(([status, { count, originalStatuses }]) => {
      const percentage = totalRows > 0 ? (count / totalRows) * 100 : 0;
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
          icon = <Clock className="h-3 w-3 text-blue-600" />
          color = "blue"
          break
        default:
          icon = <CheckCircle2 className="h-3 w-3 text-orange-600" />
          color = "orange"
      }

      return {
        label: status,
        value: count,
        percentage,
        icon,
        color,
        originalStatuses: Array.from(originalStatuses)
      }
    })
  }, [fullData])

  const handleStatusFilter = (statusesToToggle: string[]) => {
    if (statusColumn) {
      const currentFilters = (statusColumn.getFilterValue() as string[] || []);
      const isAdding = !statusesToToggle.some(s => currentFilters.includes(s));

      let updatedStatuses: string[];
      if (isAdding) {
        updatedStatuses = [...new Set([...currentFilters, ...statusesToToggle])];
      } else {
        const statusesToRemoveSet = new Set(statusesToToggle);
        updatedStatuses = currentFilters.filter(s => !statusesToRemoveSet.has(s));
      }
      
      statusColumn.setFilterValue(updatedStatuses.length ? updatedStatuses : undefined);
    }
  }

  const isStatusActive = (originalStatuses: string[]) => {
    if (!statusColumn) return false;
    const currentFilters = (statusColumn?.getFilterValue() as string[] || []);
    return originalStatuses.some(s => currentFilters.includes(s));
  }

  return (
    <div className="flex justify-between items-start gap-4">
      <div className="grid grid-cols-4 gap-2">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className={`cursor-pointer transition-all hover:bg-accent relative ${isStatusActive(metric.originalStatuses)
                ? `ring-1 ring-${metric.color}-500` 
                : ""
            }`}
            onClick={() => handleStatusFilter(metric.originalStatuses)}
          >
            {isStatusActive(metric.originalStatuses) && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusFilter(metric.originalStatuses)
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

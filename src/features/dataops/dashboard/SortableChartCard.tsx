import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WidgetHeader } from "./widgets/WidgetHeader";
import { cn } from "@/lib/utils";
import { Widget as WidgetType } from "@/types/dataops/dataops-dash"; 
import { PlotlyChart } from "./widgets/components/PlotlyChart"; 
import { LoadingState } from "@/components/shared/LoadingState";
import { LayoutDashboard, X, Check, BarChart2, Table as TableIcon } from "lucide-react";
import { WIDGET_REMOVED_EVENT } from "@/components/shared/XplorerGenericChat"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"; 

interface SortableChartCardProps {
  widget: WidgetType;
  className?: string;
  onWidgetRefresh: (widgetId: string) => Promise<void>; 
}

export const SortableChartCard: React.FC<SortableChartCardProps> = ({
  widget,
  className = "",
  onWidgetRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTableView, setIsTableView] = useState(false); 
console.log("widget", widget);

  const handleRefresh = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await onWidgetRefresh(widget.id!.toString());
    } catch (error) {
      console.error(`[SortableChartCard] Failed to refresh widget ${widget.id}:`, error);
    } finally {
      setIsRefreshing(false);
    }
  }, [widget.id, onWidgetRefresh]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleViewToggle = useCallback(() => {
    setIsTableView(prev => !prev);
  }, []);

  const handleRemove = useCallback(() => {
    if (!widget.id) return;
    const widgetRemovedEvent = new CustomEvent(WIDGET_REMOVED_EVENT, {
      detail: { widgetId: widget.id.toString() },
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(widgetRemovedEvent);
  }, [widget.id]);

  const renderChartContent = () => {
    if (isRefreshing) {
      return <LoadingState fullScreen={false} />;
    }
    if (widget.intermediate_executed_query_json) {
      return <PlotlyChart widget={widget} height={200} className="w-full h-full" />;
    }
    if (!widget.executed_query || (Array.isArray(widget.executed_query) && widget.executed_query.length === 0)) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-3">
          <div className="bg-muted/20 p-2 rounded-full mb-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">No data available</h3>
          <p className="text-xs text-muted-foreground/80 text-center">
            Chart data is not available or query returned no results.
          </p>
        </div>
      );
    }
    return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Unsupported chart type or missing data</div>;
  };

  const renderTableViewContent = () => {
    if (!widget.executed_query) {
      return <div className="p-4 text-sm text-muted-foreground">No table data available (executed_query is null/undefined).</div>;
    }

    try {
      // Handle array-of-objects format (typically system-defined, or if user-defined has this structure)
      if (Array.isArray(widget.executed_query)) {
        if (widget.executed_query.length === 0) {
          return <div className="p-4 text-sm text-muted-foreground">Table data is empty (array format).</div>;
        }
        const columns = Object.keys(widget.executed_query[0] || {});
        if (columns.length === 0) {
          return <div className="p-4 text-sm text-muted-foreground">Cannot determine columns from table data (array format).</div>;
        }
        return (
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>
                      {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {widget.executed_query.map((row: any, index: number) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column}>{String(row[column] ?? '')}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      } 
      // Handle object with column_names and column_values format (typically user-defined)
      else if (widget.executed_query.column_names && widget.executed_query.column_values) {
        const { column_names, column_values } = widget.executed_query as { column_names: string[], column_values: any[][] };
        if (!column_names || !column_values || column_names.length === 0 || column_values.length === 0 && column_names.some(c => c)) {
            // Check if column_values is empty but column_names has actual names (not just empty strings)
            if (column_values.length === 0 && column_names.some(c => c && c.trim() !== '')) {
                 // Render table with headers but no rows
            } else {
                return <div className="p-4 text-sm text-muted-foreground">Table data is empty or malformed (object format).</div>;
            }
        }

        return (
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {column_names.map((column) => (
                    <TableHead key={column}>
                      {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {column_values.map((row, index) => (
                  <TableRow key={index}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{String(cell ?? '')}</TableCell>
                    ))}
                  </TableRow>
                ))}
                 {column_values.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={column_names.length} className="text-center text-muted-foreground">
                      No data available for these columns.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        );
      } 
      // Fallback if structure is unrecognized
      else {
        return <div className="p-4 text-sm text-muted-foreground">Unrecognized table data structure.</div>;
      }
    } catch (error) {
      console.error("[SortableChartCard] Failed to render table view:", error);
      return <div className="p-4 text-sm text-destructive">Error rendering table data.</div>;
    }
  };

  const renderSQLContent = () => {
    return (
      <pre className="h-full overflow-auto text-xs font-mono whitespace-pre-wrap break-all p-3 rounded-md bg-muted/50">
        {widget.sql_query || "No SQL query available."}
      </pre>
    );
  };

  const canRemove = widget.widget_type === "user_defined";

  return (
    <div className={cn("h-full perspective-1000", className)} data-widget-id={widget.id?.toString()}>
      <div className={cn(
        "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
        isFlipped && "rotate-y-180"
      )}>
        {/* Front side - Chart */}
        <Card className="absolute w-full h-full bg-card border border-border/40 rounded-lg hover:shadow-md transition-all duration-200 backface-hidden">
          <CardContent className="p-3 h-full flex flex-col">
            <WidgetHeader 
              title={widget.name}
              description={widget.chart_config?.metric}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onFlip={handleFlip}
              onRemove={canRemove ? handleRemove : undefined}
              showFlip={true}
              isFlipped={isFlipped}
            />
            <div className="flex-grow mt-2 overflow-hidden">
              {renderChartContent()}
            </div>
          </CardContent>
        </Card>

        {/* Back side - SQL Query / Table View */}
        <Card className="absolute w-full h-full bg-card border border-border/40 rounded-lg hover:shadow-md transition-all duration-200 backface-hidden rotate-y-180">
          <CardContent className="p-3 h-full flex flex-col">
            <WidgetHeader
              title={isTableView ? "Table View" : "SQL Query"}
              description={widget.name}
              onFlip={handleFlip} 
              onViewChange={handleViewToggle} 
              onRemove={canRemove ? handleRemove : undefined}
              showFlip={true}
              isFlipped={isFlipped}
              isTableView={isTableView} 
            />
            <div className="flex-grow mt-2 overflow-hidden">
              {isTableView ? renderTableViewContent() : renderSQLContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

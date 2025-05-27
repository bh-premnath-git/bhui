import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Widget as WidgetType } from "@/types/dataops/dataops-dash";
import { WidgetHeader } from "./WidgetHeader";
import { LineChart } from "./charts/LineChart";
import { BarChart } from "./charts/BarChart";
import { LoadingState } from "@/components/shared/LoadingState";
import { LayoutDashboard, X, Check } from "lucide-react";
import { fetchWidgetsByIds } from "@/lib/widgetLayout";
import { useDataOps } from "@/context/dataops/DataOpsContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WidgetProps {
  widget: WidgetType;
  className?: string;
}

export const Widget = ({ widget, className = "" }: WidgetProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const [sqlQuery, setSqlQuery] = useState(widget.sql_query);
  const { dispatch, state } = useDataOps();

  const handleRefresh = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsRefreshing(true);
      const [refreshedWidget] = await fetchWidgetsByIds(state.widgets, [widget.id]);
      
      if (refreshedWidget) {
        dispatch({ 
          type: "UPDATE_WIDGET", 
          payload: refreshedWidget 
        });
      }
    } catch (error) {
      console.error("Failed to refresh widget:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [widget.id, dispatch]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
    setIsEditing(false);
  }, []);

  const handleViewToggle = useCallback(() => {
    setIsTableView(prev => !prev);
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSaveClick = useCallback(() => {
    dispatch({
      type: "UPDATE_WIDGET",
      payload: {
        ...widget,
        sql_query: sqlQuery
      }
    });
    setIsEditing(false);
  }, [sqlQuery, widget, dispatch]);

  const handleCancelEdit = useCallback(() => {
    setSqlQuery(widget.sql_query);
    setIsEditing(false);
  }, [widget.sql_query]);

  const renderTableView = () => {
    if (!widget.executed_query?.length) return null;

    const columns = Object.keys(widget.executed_query[0]);

    return (
      <div className="overflow-auto max-h-[200px]">
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
            {widget.executed_query.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column}>{String(row[column])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderChart = () => {
    if (isRefreshing) {
      return <LoadingState  />;
    }

    if (!widget.executed_query || widget.executed_query.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[200px] p-3">
          <div className="bg-muted/20 p-2 rounded-full mb-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">No data available</h3>
          <p className="text-xs text-muted-foreground/80 text-center">
            No data matches the current filter conditions
          </p>
        </div>
      );
    }

    const chartType = widget.chart_config.type;
    switch (chartType) {
      case "line_chart":
        return <LineChart widget={widget} height={200} />;
      case "bar_chart":
        return <BarChart widget={widget} height={200} />;
      default:
        return <div>Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className={cn(
      "h-full perspective-1000",
      className
    )}>
      <div className={cn(
        "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
        isFlipped && "rotate-y-180"
      )}>
        {/* Front side - Chart */}
        <Card className="absolute w-full h-full bg-card border border-border/40 rounded-lg hover:shadow-md transition-all duration-200 backface-hidden">
          <CardContent className="p-3">
            <WidgetHeader 
              title={widget.name} 
              description={widget.chart_config.metric}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onFlip={handleFlip}
              showFlip
              isFlipped={isFlipped}
            />
            <div className="mt-2">
              {renderChart()}
            </div>
          </CardContent>
        </Card>

        {/* Back side - SQL Query */}
        <Card className="absolute w-full h-full bg-card border border-border/40 rounded-lg hover:shadow-md transition-all duration-200 backface-hidden rotate-y-180">
          <CardContent className="p-3">
            <WidgetHeader 
              title="SQL Query"
              description={widget.name}
              onFlip={handleFlip}
              onViewChange={handleViewToggle}
              showFlip
              isFlipped={isFlipped}
              isTableView={isTableView}
            />
            <div className="mt-2 h-[200px]">
              {isEditing ? (
                <div className="flex flex-col h-full gap-2">
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="flex-1 font-mono text-xs resize-none"
                    placeholder="Enter SQL query..."
                  />
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSaveClick}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative h-full">
                  {isTableView ? (
                    renderTableView()
                  ) : (
                    <pre className="h-full overflow-auto text-xs font-mono whitespace-pre-wrap break-all p-3 rounded-md bg-muted/50">
                      {sqlQuery}
                    </pre>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleEditClick}
                  >
                    Edit Query
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
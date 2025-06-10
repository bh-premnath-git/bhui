import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Filter,
  XCircle
} from "lucide-react";
import { useDataOps } from "@/context/dataops/DataOpsContext";
import { ExecutedQueryItem } from "@/types/dataops/dataops-dash";

export const DashboardHeader = () => {
  const { state, dispatch } = useDataOps();

  const projectNames = useMemo(() => {
    const projectSet = new Set<string>();
    state.widgets.forEach(widget => {
      if (Array.isArray(widget.executed_query)) {
        (widget.executed_query as ExecutedQueryItem[]).forEach(item => {
          projectSet.add(item.project_name);
        });
      }
    });
    return Array.from(projectSet).sort();
  }, [state.widgets]);

  const handleProjectChange = useCallback((value: string) => {
    dispatch({
      type: "SET_PROJECT_FILTER",
      payload: value === "all" ? null : value
    });
  }, [dispatch]);

  const handleTimeRangeChange = useCallback((value: string) => {
    dispatch({
      type: "SET_TIME_RANGE_FILTER",
      payload: value === "all" ? null : value
    });
  }, [dispatch]);

  const handleResetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, [dispatch]);

  return (
    <div className="bg-background sticky top-0 z-10 border-b border-border/40 pl-5 pb-2">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={state.filters.projectName || "all"}
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent >
              <SelectItem key="project-all" value="all">All Projects</SelectItem>
              {projectNames.map((project, index) => (
                <SelectItem key={project + index} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={state.filters.timeRange || "all"}
            onValueChange={handleTimeRangeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="time-all" value="all">All Time</SelectItem>
              <SelectItem key="time-today" value="today">Today</SelectItem>
              <SelectItem key="time-yesterday" value="yesterday">Yesterday</SelectItem>
              <SelectItem key="time-7days" value="7days">Last 7 Days</SelectItem>
              <SelectItem key="time-30days" value="30days">Last 30 Days</SelectItem>
              <SelectItem key="time-90days" value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(state.filters.projectName || state.filters.timeRange) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
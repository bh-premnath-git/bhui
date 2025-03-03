import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnalytics } from "@/context/AnalyticsContext";
import { MoreHorizontal, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import StatsCards from "./analytics/StatsCards";
import AnalyticsChart from "./analytics/AnalyticsChart";
import AnalyticsTable from "./analytics/AnalyticsTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getConversationContext } from "@/api/analytics-api";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import QuickStyleControls from "./QuickStyleControls";

// Add this function before the component
function saveDashboard(dashboard: any) {
  // In a real app, this would save to a backend
  console.log("Saving dashboard:", dashboard);
  
  // Generate a random ID for the saved dashboard
  const id = `dashboard-${Date.now()}`;
  
  // Store in localStorage for demo purposes
  const savedDashboards = JSON.parse(localStorage.getItem('savedDashboards') || '[]');
  savedDashboards.push({
    id,
    ...dashboard,
    savedAt: new Date().toISOString()
  });
  localStorage.setItem('savedDashboards', JSON.stringify(savedDashboards));
  
  // Return the dashboard with ID
  return {
    id,
    ...dashboard
  };
}

export default function AnalyticsPanel({ 
  dashboardData: propsDashboardData,
  showHeader = true,
  chartStyles: propsChartStyles,
  viewMode: propsViewMode = "chart",
  onViewModeChange,
  isolatedMode = false
}: { 
  dashboardData?: any,
  showHeader?: boolean,
  chartStyles?: ChartStyles,
  viewMode?: "chart" | "table" | "sql",
  onViewModeChange?: (mode: "chart" | "table" | "sql") => void,
  isolatedMode?: boolean
}) {
  // Use local state for everything when in isolated mode
  const [localViewMode, setLocalViewMode] = useState(propsViewMode);
  const [localChartStyles, setLocalChartStyles] = useState(propsChartStyles || defaultChartStyles);
  const [localActiveFilters, setLocalActiveFilters] = useState<string[]>([]);
  
  // Get context values only if not in isolated mode
  const { 
    dashboardData: contextDashboardData,
    isLoading,
    error,
    viewMode: contextViewMode, 
    setViewMode: setContextViewMode,
    formatCurrency, 
    activeFilters, 
    setActiveFilters,
    chartStyles: contextChartStyles,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    fetchData,
    currentQuestion
  } = useAnalytics();
  
  const navigate = useNavigate();
  const [context] = useState(getConversationContext());

  // Use either props or context based on isolated mode
  const dashboardData = propsDashboardData || contextDashboardData;
  const effectiveViewMode = isolatedMode ? localViewMode : (propsViewMode || contextViewMode);
  const effectiveChartStyles = isolatedMode ? localChartStyles : (propsChartStyles || contextChartStyles);
  const effectiveActiveFilters = isolatedMode ? localActiveFilters : activeFilters;

  const handleFilterClick = (brand: string) => {
    const updateFilters = (prevFilters: string[]) => {
      const isSelected = prevFilters.includes(brand);
      if (isSelected) {
        return prevFilters.filter(f => f !== brand);
      } else {
        return [...prevFilters, brand];
      }
    };
    
    if (isolatedMode) {
      setLocalActiveFilters(updateFilters);
    } else {
      setActiveFilters(updateFilters);
    }
  };

  const handleSave = (type: 'existing' | 'new') => {
    const dashboard = {
      name: dashboardData.title,
      data: dashboardData.salesData,
      styles: effectiveChartStyles,
      type: effectiveViewMode as 'chart' | 'table',
    };
    
    const savedDashboard = saveDashboard(dashboard);
    
    toast.success("Dashboard saved successfully", {
      description: `Dashboard saved ${type === 'new' ? 'as new' : 'to existing'}.`
    });

    navigate(`/saved-dashboard/${savedDashboard.id}`);
  };

  // Handle view mode changes
  const handleViewModeChange = (mode: "chart" | "table" | "sql") => {
    console.log("Changing view mode to:", mode);
    
    if (onViewModeChange) {
      // If we have an external handler, use it
      onViewModeChange(mode);
    } else if (isolatedMode) {
      // If we're in isolated mode, use local state
      setLocalViewMode(mode);
    } else {
      // Otherwise use context
      setContextViewMode(mode);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        <p>Error loading data. Please try again later.</p>
      </div>
    );
  }

  // Handle the case when no data is available (null response from API)
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-muted p-3">
              <SearchIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No data available for this query</h3>
            <p className="text-muted-foreground max-w-md">
              I couldn't find any relevant data for "{currentQuestion}". 
              Try refining your question or asking about a different topic.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const filteredData = effectiveActiveFilters.length > 0
    ? dashboardData.salesData.map(row => {
        const filteredRow = { date: row.date };
        effectiveActiveFilters.forEach(filter => {
          filteredRow[filter] = row[filter];
        });
        return filteredRow;
      })
    : dashboardData.salesData;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Handle updates to chart styles within this panel only
  const updateLocalChartStyles = (newStyles) => {
    setLocalChartStyles(prev => ({ ...prev, ...newStyles }));
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">{dashboardData.title}</h1>
          <p className="text-muted-foreground">
            {dashboardData.timeRange} · {dashboardData.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={effectiveViewMode} onValueChange={(v) => handleViewModeChange(v as "chart" | "table" | "sql")}>
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="sql">SQL</TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal className="h-5 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSave('existing')}>
                Save to Existing Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSave('new')}>
                Save as New Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Only show stats cards if metrics are available in the response */}
      {dashboardData.metrics && dashboardData.metrics.length > 0 && (
        <StatsCards 
          metrics={dashboardData.metrics}
          activeFilter={effectiveActiveFilters.join(',')}
          onFilterClick={handleFilterClick}
          formatCurrency={formatCurrency}
        />
      )}

      <QuickStyleControls 
        chartStyles={effectiveChartStyles} 
        setChartStyles={updateLocalChartStyles} 
      />

      <Tabs value={effectiveViewMode} onValueChange={(v) => handleViewModeChange(v as "chart" | "table" | "sql")}>
        <TabsContent value="chart">
          <AnalyticsChart 
            data={filteredData}
            activeFilter={effectiveActiveFilters.join(',')}
            formatCurrency={formatCurrency}
            chartStyles={effectiveChartStyles}
          />
        </TabsContent>

        <TabsContent value="table">
          <AnalyticsTable 
            data={currentData}
            activeFilter={effectiveActiveFilters.join(',')}
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            onNextPage={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
        
        <TabsContent value="sql">
          <Card className="col-span-4">
            <CardContent className="p-6">
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {dashboardData.sqlQuery || 
                  `SELECT * \nFROM ${dashboardData.tableName || "sales"} \nWHERE date >= '${dashboardData.timeRange || "Last 30 days"}' \nLIMIT 100;`}
              </pre>
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(dashboardData.sqlQuery || '')}
                >
                  Copy SQL
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add detailed explanation section */}
      {dashboardData.explanation && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Analysis</h3>
            <div className="text-muted-foreground space-y-2">
              {typeof dashboardData.explanation === 'string' ? (
                <p>{dashboardData.explanation}</p>
              ) : (
                dashboardData.explanation.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add conversation context section */}
      {dashboardData.explanation && context.recentQuestions.length > 1 && (
        <Card className="mt-4">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Conversation Context</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Recent questions:</span>
                {context.recentQuestions.map((q, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {q}
                  </Badge>
                ))}
              </div>
              {context.recentTables.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Tables explored:</span>
                  {context.recentTables.map((t, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
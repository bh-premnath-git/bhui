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

export default function AnalyticsPanel() {
  const { 
    dashboardData,
    isLoading,
    error,
    viewMode, 
    setViewMode,
    formatCurrency, 
    activeFilters, 
    setActiveFilters,
    chartStyles,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    fetchData,
    currentQuestion
  } = useAnalytics();
  
  const navigate = useNavigate();

  const handleFilterClick = (brand: string) => {
    setActiveFilters((prevFilters: string[]) => {
      const isSelected = prevFilters.includes(brand);
      if (isSelected) {
        const newFilters = prevFilters.filter(f => f !== brand);
        toast.error(`Removed ${brand} from filters`);
        return newFilters;
      } else {
        toast.success(`Added ${brand} to filters`);
        return [...prevFilters, brand];
      }
    });
  };

  const handleSave = (type: 'existing' | 'new') => {
    const dashboard = {
      name: dashboardData.title,
      data: dashboardData.salesData,
      styles: chartStyles,
      type: viewMode as 'chart' | 'table',
    };
    
    const savedDashboard = saveDashboard(dashboard);
    
    toast.success("Dashboard saved successfully", {
      description: `Dashboard saved ${type === 'new' ? 'as new' : 'to existing'}.`
    });

    navigate(`/saved-dashboard/${savedDashboard.id}`);
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
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => fetchData("")}>
                Show default data
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const filteredData = activeFilters.length > 0
    ? dashboardData.salesData.map(row => {
        const filteredRow = { date: row.date };
        activeFilters.forEach(filter => {
          filteredRow[filter] = row[filter];
        });
        return filteredRow;
      })
    : dashboardData.salesData;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{dashboardData.title}</h1>
          <p className="text-muted-foreground">
            {dashboardData.timeRange} · {dashboardData.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as "chart" | "table")}>
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
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
          activeFilter={activeFilters.join(',')}
          onFilterClick={handleFilterClick}
          formatCurrency={formatCurrency}
        />
      )}

      <Tabs value={viewMode}>
        <TabsContent value="chart">
          <AnalyticsChart 
            data={filteredData}
            activeFilter={activeFilters.join(',')}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="table">
          <AnalyticsTable 
            data={currentData}
            activeFilter={activeFilters.join(',')}
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            onNextPage={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            formatCurrency={formatCurrency}
          />
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
    </div>
  );
}
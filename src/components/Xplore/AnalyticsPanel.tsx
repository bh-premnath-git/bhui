import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MoreHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useDashboard } from "@/contexts/DashboardContext";
import { useNavigate } from "react-router-dom";
import StatsCards from "./analytics/StatsCards";
import AnalyticsChart from "./analytics/AnalyticsChart";
import AnalyticsTable from "./analytics/AnalyticsTable";

export default function AnalyticsPanel() {
  const { 
    viewMode, 
    setViewMode, 
    data,
    isLoading,
    error, 
    formatCurrency, 
    activeFilters, 
    setActiveFilters,
    chartStyles,
    currentPage,
    setCurrentPage,
    itemsPerPage
  } = useAnalytics();
  const { getColorSchemeColors } = useColorScheme();
  const { toast } = useToast();
  const { saveDashboard } = useDashboard();
  const navigate = useNavigate();

  const colors = getColorSchemeColors(chartStyles.colorScheme);

  const handleSave = (type: 'existing' | 'new') => {
    const dashboard = {
      name: 'Daily Sales by Brand',
      data,
      styles: chartStyles,
      type: viewMode as 'chart' | 'table',
    };
    
    const savedDashboard = saveDashboard(dashboard);
    
    toast({
      title: "Dashboard Saved",
      description: `Dashboard saved ${type === 'new' ? 'as new' : 'to existing'} successfully.`,
    });

    navigate(`/saved-dashboard/${savedDashboard.id}`);
  };

  const handleFilterClick = (brand: string) => {
    setActiveFilters((prevFilters: string[]) => {
      const isSelected = prevFilters.includes(brand);
      if (isSelected) {
        const newFilters = prevFilters.filter(f => f !== brand);
        toast({
          title: "Filter Removed",
          description: `Removed ${brand} from filters`,
        });
        return newFilters;
      } else {
        toast({
          title: "Filter Added",
          description: `Added ${brand} to filters`,
        });
        return [...prevFilters, brand];
      }
    });
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

  const filteredData = activeFilters.length > 0
    ? data.map(row => {
        const filteredRow = { date: row.date };
        activeFilters.forEach(filter => {
          filteredRow[filter] = row[filter];
        });
        return filteredRow;
      })
    : data;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(currentPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(currentPage + 1, totalPages));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Daily Sales by Brand</h1>
          <p className="text-muted-foreground">
            Last 7 days · What were our daily sales for each brand?
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

      <StatsCards 
        data={data}
        activeFilter={activeFilters.join(',')}
        onFilterClick={handleFilterClick}
        formatCurrency={formatCurrency}
      />

      <Tabs value={viewMode}>
        <TabsContent value="chart">
          <AnalyticsChart 
            data={filteredData}
            activeFilter={activeFilters.join(',')}
            styles={chartStyles}
            colors={colors}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="table">
          <AnalyticsTable 
            data={currentData}
            activeFilter={activeFilters.join(',')}
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
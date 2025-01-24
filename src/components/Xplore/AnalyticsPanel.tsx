import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useChartStyles } from "@/hooks/useChartStyles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MoreHorizontal } from "lucide-react";
import useToast from '@/components/teast-service';
import { useDashboard } from "@/contexts/DashboardContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsCards from "./analytics/StatsCards";
import AnalyticsChart from "./analytics/AnalyticsChart";
import AnalyticsTable from "./analytics/AnalyticsTable";

const ITEMS_PER_PAGE = 5;

export default function AnalyticsPanel() {
  const { viewMode, setViewMode } = useAnalytics();
  const { data, formatCurrency } = useAnalyticsData();
  const { styles } = useChartStyles();
  const { getColorSchemeColors } = useColorScheme();
	const [ToastComponent, showToast] = useToast();
  const { saveDashboard } = useDashboard();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const colors = getColorSchemeColors(styles.colorScheme);

  const handleSave = (type: 'existing' | 'new') => {
    const dashboard = {
      name: 'Daily Sales by Brand',
      data,
      styles,
      type: viewMode as 'chart' | 'table',
    };
    
    const savedDashboard = saveDashboard(dashboard);
    
    showToast(`Dashboard saved ${type === 'new' ? 'as new' : 'to existing'} successfully.`, { color: '#00b060' });
    navigate(`/saved-dashboard/${savedDashboard.id}`);
  };

  const handleFilterClick = (brand: string) => {
    if (activeFilter === brand) {
      setActiveFilter(null);
    showToast('Showing all brands data', { color: '#00b060' });
    } else {
      setActiveFilter(brand);
      showToast(`Showing data for ${brand}`, { color: '#00b060' });
     
    }
  };

  const filteredData = activeFilter
    ? data.map(row => ({
        ...row,
        [activeFilter]: row[activeFilter as keyof typeof row],
        date: row.date,
      }))
    : data;

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
        activeFilter={activeFilter}
        onFilterClick={handleFilterClick}
        formatCurrency={formatCurrency}
      />

      <Tabs value={viewMode}>
        <TabsContent value="chart">
          <AnalyticsChart 
            data={filteredData}
            activeFilter={activeFilter}
            styles={styles}
            colors={colors}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="table">
          <AnalyticsTable 
            data={currentData}
            activeFilter={activeFilter}
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
      <ToastComponent />
    </div>
  );
}
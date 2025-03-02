import { Card, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, AreaChart, ScatterChart } from "@/components/bh-charts";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useMemo, useState, useEffect } from "react";

interface AnalyticsChartProps {
  data: GenericData[];
  activeFilter: string;
  formatCurrency: (value: number) => string;
  chartStyles: ChartStyles;
}

export default function AnalyticsChart({ 
  data, 
  activeFilter,
  formatCurrency,
  chartStyles 
}: AnalyticsChartProps) {
  const { dashboardData } = useAnalytics();
  const [chartData, setChartData] = useState([]);
  
  // Log received data for debugging
  console.log("Raw chart data received:", data);
  console.log("Chart styles:", chartStyles);
  
  // Effect to process and ensure data
  useEffect(() => {
    // Check if we have real data
    if (data && data.length > 0) {
      console.log("Using provided data");
      setChartData(data);
    } else {
      // Create fallback sample data if none provided
      console.log("Creating sample data");
      const sampleData = [
        { date: "Jan", "North America": 425000, "Europe": 352000, "Asia": 312000, "Latin America": 185000, "Africa": 97000 },
        { date: "Feb", "North America": 430000, "Europe": 365000, "Asia": 325000, "Latin America": 190000, "Africa": 99000 },
        { date: "Mar", "North America": 445000, "Europe": 372000, "Asia": 340000, "Latin America": 195000, "Africa": 102000 }
      ];
      setChartData(sampleData);
    }
  }, [data]);
  
  // Use chartData instead of finalData in your visualizations
  const dataKeys = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    
    // For pie charts with category/value structure
    if (chartStyles.chartType === 'pie' && 'category' in chartData[0] && 'value' in chartData[0]) {
      return chartData.map(item => item.category as string);
    }
    
    // For other charts, use the brands from the dashboard data
    return activeFilter ? 
      activeFilter.split(',') : 
      (dashboardData?.brands || Object.keys(chartData[0]).filter(k => k !== 'date'));
  }, [chartData, activeFilter, chartStyles.chartType, dashboardData]);

  const formattedData = useMemo(() => {
    return chartData.map(item => ({
      ...item,
      formatCurrency
    }));
  }, [chartData, formatCurrency]);

  const pieData = useMemo(() => {
    if (chartStyles.chartType !== 'pie') return [];
    
    // Handle data that's already in category/value format
    if (chartData.length > 0 && 'category' in chartData[0] && 'value' in chartData[0]) {
      return chartData.map(item => ({
        name: item.category,
        value: item.value
      }));
    }
    
    // Handle data that needs to be transformed to pie format
    return dataKeys.map(brand => ({
      name: brand,
      value: formattedData.reduce((sum, item) => sum + (Number(item[brand]) || 0), 0)
    }));
  }, [dataKeys, formattedData, chartStyles.chartType, chartData]);

  // Determine x-axis data key based on data structure
  const xAxisDataKey = useMemo(() => {
    if (!chartData || chartData.length === 0) return "date";
    
    // Check if data has a date field
    if ('date' in chartData[0]) return "date";
    if ('category' in chartData[0]) return "category";
    
    // Default to first key that's not in dataKeys
    const firstKey = Object.keys(chartData[0]).find(key => !dataKeys.includes(key));
    return firstKey || "date";
  }, [chartData, dataKeys]);

  const renderChart = () => {
    // Handle empty data
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available to display
        </div>
      );
    }

    try {
      switch (chartStyles.chartType) {
        case 'line':
          return (
            <LineChart 
              data={formattedData}
              xAxisDataKey={xAxisDataKey}
              lines={dataKeys}
              colors={chartStyles.colors}
            />
          );
        case 'area':
          return (
            <AreaChart 
              data={formattedData}
              xAxisDataKey={xAxisDataKey}
              areas={dataKeys}
              colors={chartStyles.colors}
              stacked={true}
            />
          );
        case 'scatter':
          return (
            <ScatterChart 
              data={formattedData}
              xAxisDataKey={xAxisDataKey}
              yAxisDataKey={dataKeys[0]}
              groups={dataKeys}
              colors={chartStyles.colors}
            />
          );
        case 'pie':
          return (
            <PieChart 
              data={pieData}
              dataKey="value"
              nameKey="name"
              colors={chartStyles.colors}
            />
          );
        case 'bar':
        default:
          return (
            <BarChart 
              data={formattedData}
              xAxisDataKey={xAxisDataKey}
              bars={dataKeys}
              colors={chartStyles.colors}
            />
          );
      }
    } catch (error) {
      console.error("Error rendering chart:", error);
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-destructive">
          <p>Error rendering chart</p>
          <p className="text-xs text-muted-foreground mt-2">{error.message}</p>
        </div>
      );
    }
  };

  return (
    <Card className="col-span-4">
      <CardContent className="p-6">
        {renderChart()}
      </CardContent>
    </Card>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, AreaChart, ScatterChart } from "@/components/bh-charts";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useMemo } from "react";

interface AnalyticsChartProps {
  data: GenericData[];
  activeFilter: string;
  formatCurrency: (value: number) => string;
}

export default function AnalyticsChart({ 
  data, 
  activeFilter,
  formatCurrency 
}: AnalyticsChartProps) {
  const { chartStyles, dashboardData } = useAnalytics();
  
  // Determine which fields to use as data keys based on the data structure
  const dataKeys = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // For pie charts with category/value structure
    if (chartStyles.chartType === 'pie' && 'category' in data[0] && 'value' in data[0]) {
      return data.map(item => item.category as string);
    }
    
    // For other charts, use the brands from the dashboard data
    return activeFilter ? 
      activeFilter.split(',') : 
      (dashboardData?.brands || []);
  }, [data, activeFilter, chartStyles.chartType, dashboardData]);

  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formatCurrency
    }));
  }, [data, formatCurrency]);

  const pieData = useMemo(() => {
    if (chartStyles.chartType !== 'pie') return [];
    
    // Handle data that's already in category/value format
    if (data.length > 0 && 'category' in data[0] && 'value' in data[0]) {
      return data.map(item => ({
        name: item.category,
        value: item.value
      }));
    }
    
    // Handle data that needs to be transformed to pie format
    return dataKeys.map(brand => ({
      name: brand,
      value: formattedData.reduce((sum, item) => sum + (Number(item[brand]) || 0), 0)
    }));
  }, [dataKeys, formattedData, chartStyles.chartType, data]);

  // Determine x-axis data key based on data structure
  const xAxisDataKey = useMemo(() => {
    if (!data || data.length === 0) return "date";
    
    // Check if data has a date field
    if ('date' in data[0]) return "date";
    if ('category' in data[0]) return "category";
    
    // Default to first key that's not in dataKeys
    const firstKey = Object.keys(data[0]).find(key => !dataKeys.includes(key));
    return firstKey || "date";
  }, [data, dataKeys]);

  const renderChart = () => {
    // Handle empty data
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available to display
        </div>
      );
    }

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
  };

  return (
    <Card className="col-span-4">
      <CardContent className="p-6">
        {renderChart()}
      </CardContent>
    </Card>
  );
}
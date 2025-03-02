import { Card, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, AreaChart, ScatterChart } from "@/components/bh-charts";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useMemo, useState, useEffect } from "react";

// Add these type definitions at the top of the file
interface GenericData {
  [key: string]: any;
}

interface ChartStyles {
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  colors?: string[];
  colorScheme?: string;
}

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
  
  // Enhanced debugging
  console.log("Chart component rendering with data:", data);
  console.log("Chart styles:", chartStyles);
  
  // Improved effect to process and ensure data
  useEffect(() => {
    // Check if we have real data
    if (data && data.length > 0) {
      console.log("Using provided data for chart:", data);
      setChartData(data);
    } else {
      // Create fallback sample data if none provided
      console.log("Creating sample data for chart");
      const sampleData = [
        { date: "Jan", "North America": 425000, "Europe": 352000, "Asia": 312000, "Latin America": 185000, "Africa": 97000 },
        { date: "Feb", "North America": 430000, "Europe": 365000, "Asia": 325000, "Latin America": 190000, "Africa": 99000 },
        { date: "Mar", "North America": 445000, "Europe": 372000, "Asia": 340000, "Latin America": 195000, "Africa": 102000 }
      ];
      setChartData(sampleData);
    }
  }, [data]);
  
  // Use dataKeys for chart rendering - enhanced to handle edge cases
  const dataKeys = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      console.log("No chart data for dataKeys");
      return [];
    }
    
    console.log("Generating dataKeys from:", chartData);
    
    // For pie charts with category/value structure
    if (chartStyles.chartType === 'pie' && 'category' in chartData[0] && 'value' in chartData[0]) {
      return chartData.map(item => item.category as string);
    }
    
    // For other charts, use the brands from the dashboard data or keys from chart data
    if (activeFilter) {
      return activeFilter.split(',');
    } else if (dashboardData?.brands && dashboardData.brands.length > 0) {
      return dashboardData.brands;
    } else {
      // Extract keys from first data item, exclude 'date' and similar fields
      return Object.keys(chartData[0]).filter(k => 
        k !== 'date' && 
        k !== 'category' && 
        k !== 'name' &&
        k !== 'value'
      );
    }
  }, [chartData, activeFilter, chartStyles.chartType, dashboardData]);

  // Ensure number values for chart data
  const formattedData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }
    
    return chartData.map(item => {
      const newItem = { ...item };
      // Convert string numbers to actual numbers for chart rendering
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'string') {
          // First try direct conversion
          let numValue = Number(item[key]);
          
          // If that fails, try removing currency symbols
          if (isNaN(numValue) && typeof item[key] === 'string') {
            // Remove $ and , from values like $12,100
            numValue = Number(item[key].replace(/[$,]/g, ''));
          }
          
          if (!isNaN(numValue)) {
            newItem[key] = numValue;
          }
        }
      });
      return newItem;
    });
  }, [chartData]);

  // Correctly format pie chart data
  const pieData = useMemo(() => {
    if (chartStyles.chartType !== 'pie' || !chartData || chartData.length === 0) {
      return [];
    }
    
    console.log("Preparing pie data");
    
    // Handle data that's already in category/value format
    if ('category' in chartData[0] && 'value' in chartData[0]) {
      return chartData.map(item => ({
        name: item.category,
        value: typeof item.value === 'string' 
          ? Number(item.value.replace(/[$,]/g, '')) 
          : item.value
      }));
    }
    
    // If we're using table-like data with multiple columns
    // We'll create a pie chart that sums the values for each column/brand
    if (dataKeys.length > 0) {
      // Create a simplified array of objects with name and value
      return dataKeys.map(key => {
        // Calculate total value for this key across all data points
        const total = formattedData.reduce((sum, item) => {
          return sum + (typeof item[key] === 'number' ? item[key] : 0);
        }, 0);
        
        return {
          name: key,
          value: total
        };
      });
    }
    
    // Fallback empty data
    return [];
  }, [dataKeys, formattedData, chartStyles.chartType, chartData]);

  // More robust x-axis data key determination
  const xAxisDataKey = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return "date";
    }
    
    // Check common date field names
    const dateFields = ['date', 'day', 'month', 'year', 'time', 'period'];
    for (const field of dateFields) {
      if (field in chartData[0]) {
        return field;
      }
    }
    
    // If no date field is found, check for category or name
    if ('category' in chartData[0]) return "category";
    if ('name' in chartData[0]) return "name";
    
    // Default to first key that's not in dataKeys
    const firstKey = Object.keys(chartData[0]).find(key => !dataKeys.includes(key));
    return firstKey || "date";
  }, [chartData, dataKeys]);

  // Enhanced chart rendering with better error handling
  const renderChart = () => {
    // Handle empty data
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available to display
        </div>
      );
    }

    console.log("Rendering chart with type:", chartStyles.chartType);
    console.log("Using dataKeys:", dataKeys);
    console.log("X-axis key:", xAxisDataKey);

    if (dataKeys.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data series to display. Try selecting different filters.
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
              colors={chartStyles.colors || ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']}
            />
          );
        case 'area':
          return (
            <AreaChart 
              data={formattedData}
              xAxisDataKey={xAxisDataKey}
              areas={dataKeys}
              colors={chartStyles.colors || ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']}
              stacked={true}
            />
          );
        case 'scatter':
          // Ensure we have at least 2 data series for scatter plot
          if (dataKeys.length >= 2) {
            return (
              <ScatterChart 
                data={formattedData}
                xAxisDataKey={xAxisDataKey}
                yAxisDataKey={dataKeys[0]}
                groups={dataKeys.slice(1)}
                colors={chartStyles.colors || ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']}
              />
            );
          } else {
            return (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Scatter charts require multiple data series
              </div>
            );
          }
        case 'pie':
          return (
            <PieChart 
              data={pieData}
              dataKey="value"
              nameKey="name"
              colors={chartStyles.colors || ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']}
            />
          );
        case 'bar':
        default:
          return (
            <BarChart 
              data={formattedData}
              xAxisDataKey={xAxisDataKey}
              bars={dataKeys}
              colors={chartStyles.colors || ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']}
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
import { LineChart, BarChart, DonutChart } from '@/components/bh-charts'

// Using the same color system from charts.tsx
const CHART_COLORS = {
  chart1: "var(--chart-1-color)", 
  chart2: "var(--chart-2-color)", 
  chart3: "var(--chart-3-color)", 
  chart4: "var(--chart-4-color)",
  chart5: "var(--chart-5-color)"
}

// Color palettes for different chart types
const palettes = {
  status: [CHART_COLORS.chart1, CHART_COLORS.chart2, CHART_COLORS.chart3, CHART_COLORS.chart4],
  trend: [CHART_COLORS.chart1, CHART_COLORS.chart2, CHART_COLORS.chart3, CHART_COLORS.chart4, CHART_COLORS.chart5],
  comparison: [CHART_COLORS.chart1, CHART_COLORS.chart3, CHART_COLORS.chart5]
}

interface ChatChartViewProps {
  data: any[];
  config?: {
    xAxis?: {
      label?: string;
      labelOffset?: number;
    };
    yAxis?: {
      label?: string;
      labelOffset?: number;
    };
    chart_type?: string;
  };
}

// Helper to detect main data property from array items
const detectDataProperty = (data: any[]): string => {
  if (!data.length) return 'value';
  
  // First check for the new x_axis/y_axis format
  if (data[0].hasOwnProperty('y_axis')) {
    return 'y_axis';
  }
  
  // Get first item and find numeric properties other than "name"
  const item = data[0];
  const props = Object.keys(item).filter(key => 
    key !== 'name' && 
    key !== 'x_axis' &&
    typeof item[key] === 'number' || !isNaN(Number(item[key]))
  );
  
  return props[0] || 'value';
};

// Helper to determine chart type based on data structure and metadata
const determineChartType = (data: any[], config?: any): 'bar' | 'line' | 'donut' => {
  if (!data.length) return 'bar';
  
  // Check if chart_type is explicitly provided
  if (config?.chart_type) {
    const chartType = config.chart_type.toLowerCase();
    if (chartType.includes('line')) return 'line';
    if (chartType.includes('bar')) return 'bar';
    if (chartType.includes('pie') || chartType.includes('donut')) return 'donut';
  }
  
  // Check for donut chart format (has category/value structure)
  if (data[0].hasOwnProperty('category') && data[0].hasOwnProperty('value')) {
    return 'donut';
  }
  
  // Check if data has temporal x-axis (dates) - use line chart
  if (data[0].hasOwnProperty('x_axis') && 
     (data[0].x_axis.toString().includes('-') || 
      !isNaN(Date.parse(data[0].x_axis.toString())))) {
    return 'line';
  }
  
  // Check property names for clues
  const dataKey = detectDataProperty(data);
  if (dataKey.includes('cost') || dataKey.includes('time')) return 'line';
  if (dataKey.includes('failed') || dataKey.includes('count')) return 'bar';
  
  return 'bar'; // Default
};

// Helper to transform data for chart components
const transformData = (data: any[]): any[] => {
  if (!data.length) return data;
  
  // Check if data is already in the right format
  if (data[0].hasOwnProperty('name')) {
    return data;
  }
  
  // Transform data from x_axis/y_axis format to name/value format
  return data.map(item => {
    if (item.hasOwnProperty('x_axis') && item.hasOwnProperty('y_axis')) {
      return {
        name: item.x_axis,
        value: parseFloat(item.y_axis),
        ...item // Keep other properties
      };
    }
    return item;
  });
};

export function ChatChartView({ data, config }: ChatChartViewProps) {
  if (!data || !data.length) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }
  
  // Transform data to format expected by chart components
  const transformedData = transformData(data);
  
  // Determine chart type from data and config
  const chartType = determineChartType(data, config);
  
  // Get the data key to use for values
  const dataKey = data[0].hasOwnProperty('y_axis') ? 'value' : detectDataProperty(transformedData);
  
  // Extract axis labels from config
  const xAxisLabel = config?.xAxis?.label || '';
  const yAxisLabel = config?.yAxis?.label || '';
  
  console.log("Chart rendering with:", { 
    chartType, 
    dataKey, 
    xAxisLabel, 
    yAxisLabel, 
    sampleData: transformedData[0] 
  });
  
  // Render different chart types based on detection
  switch (chartType) {
    case 'donut':
      return (
        <div className="h-[300px]">
          <DonutChart 
            data={transformedData}
            nameKey="name" // Use name instead of category
            dataKey="value"
            colors={palettes.status}
          />
        </div>
      );
      
    case 'line':
      // For LineChart, include the axis labels in the config object
      const lineChartConfig = {
        ...(config || {}),
        xAxisLabel,
        yAxisLabel
      };
      
      return (
        <div className="h-[300px]">
          <LineChart 
            data={transformedData}
            xAxisDataKey="name"
            lines={[dataKey]}
            colors={palettes.trend}
            config={lineChartConfig}
          />
        </div>
      );
      
    case 'bar':
    default:
      return (
        <div className="h-[300px]">
          <BarChart 
            data={transformedData}
            xAxisDataKey="name"
            bars={[dataKey]}
            colors={palettes.status}
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
          />
        </div>
      );
  }
}
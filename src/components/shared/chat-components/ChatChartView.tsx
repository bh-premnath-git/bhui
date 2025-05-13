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
  data: any[]
}

// Helper to detect main data property from array items
const detectDataProperty = (data: any[]): string => {
  if (!data.length) return 'success';
  
  // Get first item and find numeric properties other than "name"
  const item = data[0];
  const props = Object.keys(item).filter(key => 
    key !== 'name' && 
    typeof item[key] === 'number'
  );
  
  return props[0] || 'success';
};

// Helper to determine chart type based on data structure
const determineChartType = (data: any[]): 'bar' | 'line' | 'donut' => {
  if (!data.length) return 'bar';
  
  // Check for donut chart format (has category/value structure)
  if (data[0].hasOwnProperty('category') && data[0].hasOwnProperty('value')) {
    return 'donut';
  }
  
  // Check property names for clues
  const dataKey = detectDataProperty(data);
  if (dataKey.includes('cost')) return 'line';
  if (dataKey.includes('failed') || dataKey.includes('count')) return 'bar';
  
  return 'bar'; // Default
};

export function ChatChartView({ data }: ChatChartViewProps) {
  if (!data || !data.length) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }
  
  const chartType = determineChartType(data);
  const dataKey = detectDataProperty(data);
  
  // Render different chart types based on detection
  switch (chartType) {
    case 'donut':
      return (
        <div className="h-[300px]">
          <DonutChart 
            data={data}
            nameKey="category"
            dataKey="value"
            colors={palettes.status}
          />
        </div>
      );
      
    case 'line':
      return (
        <div className="h-[300px]">
          <LineChart 
            data={data}
            xAxisDataKey="name"
            lines={[dataKey]}
            colors={palettes.trend}
          />
        </div>
      );
      
    case 'bar':
    default:
      return (
        <div className="h-[300px]">
          <BarChart 
            data={data}
            xAxisDataKey="name"
            bars={[dataKey]}
            colors={palettes.status}
          />
        </div>
      );
  }
}
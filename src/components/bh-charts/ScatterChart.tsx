import { useMemo, FC } from "react"
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { colorPalettes } from "@/components/bh-charts"

interface ScatterChartProps {
  data: Array<{ [key: string]: any }>;
  xKey: string;
  yKey: string;
  /** Optional: Provide a name (for Legend, Tooltip, etc.) */
  name?: string;
  /** Width and height can be numbers or percentages */
  width?: number | string;
  height?: number | string;
  /** Additional configuration options */
  config?: Record<string, any>;
}

export const ScatterChart: FC<ScatterChartProps> = ({
  data,
  xKey,
  yKey,
  name = "Series 1",
  width = "100%",
  height = 300,
  config = {},
}) => {
  // Process data to ensure x and y are numbers
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const newItem = { ...item };
      
      // Ensure x value is a number
      if (typeof newItem[xKey] === 'string') {
        newItem[xKey] = Number(newItem[xKey].replace(/[$,]/g, ''));
      }
      
      // Ensure y value is a number
      if (typeof newItem[yKey] === 'string') {
        newItem[yKey] = Number(newItem[yKey].replace(/[$,]/g, ''));
      }
      
      // If still not numbers, default to 0
      if (isNaN(newItem[xKey])) newItem[xKey] = 0;
      if (isNaN(newItem[yKey])) newItem[yKey] = 0;
      
      return newItem;
    });
  }, [data, xKey, yKey]);
  
  // Don't render if no valid data
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No valid data for scatter chart
      </div>
    );
  }

  // Determine if grid should be shown
  const showGrid = config.showGrid !== false;
  
  // Handle formatter based on config
  const formatter = (value: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), ""];
    }
    
    // Default formatter
    return [value.toLocaleString(), ""];
  };

  // Use colors from config or fall back to default colors
  const colors = config.colors || colorPalettes.supersetColors;

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {/* Optional CartesianGrid */}
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        )}
        
        {/* X-axis */}
        <XAxis 
          dataKey={xKey}
          name={config.xAxisLabel || xKey}
          stroke="#8884d8"
          tickLine={false}
          padding={{ left: 20, right: 20 }}
          tick={{ fontSize: 12 }}
        />
        
        {/* Y-axis */}
        <YAxis 
          dataKey={yKey} 
          name={config.yAxisLabel || yKey} 
          stroke="#8884d8"
          tickLine={false}
          padding={{ top: 20, bottom: 20 }}
          tick={{ fontSize: 12 }}
        />

        {/* Tooltip & Legend */}
        <Tooltip 
          formatter={formatter}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
          cursor={{ strokeDasharray: '3 3' }}
        />
        {config.showLegend !== false && <Legend />}

        {/* The Scatter series */}
        <Scatter 
          name={name} 
          data={processedData}
          fill={colors[0]}
        >
          {config.useMultipleColors !== false && processedData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Scatter>
      </RechartsScatterChart>
    </ResponsiveContainer>
  )
}

export default ScatterChart

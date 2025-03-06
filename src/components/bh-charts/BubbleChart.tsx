import React, { useMemo } from "react"
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { colorPalettes } from "@/lib/colors"

interface BubbleChartProps {
  data: any[];
  xAxisDataKey: string;
  yAxisDataKey: string;
  sizeKey: string;
  groups: string[];
  colors?: string[];
  config?: Record<string, any>;
  isMultiSeries?: boolean;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ 
  data, 
  xAxisDataKey,
  yAxisDataKey,
  sizeKey,
  groups,
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false
}) => {
  // Process data to ensure all values are numbers
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const newItem = { ...item };
      
      // Ensure x-axis value is a number
      if (typeof newItem[xAxisDataKey] === 'string') {
        newItem[xAxisDataKey] = Number(newItem[xAxisDataKey].replace(/[$,]/g, ''));
      }
      
      // Ensure y-axis value is a number
      if (typeof newItem[yAxisDataKey] === 'string') {
        newItem[yAxisDataKey] = Number(newItem[yAxisDataKey].replace(/[$,]/g, ''));
      }
      
      // Ensure size value is a number
      if (typeof newItem[sizeKey] === 'string') {
        newItem[sizeKey] = Number(newItem[sizeKey].replace(/[$,]/g, ''));
      }
      
      // If still not numbers, default to 0
      if (isNaN(newItem[xAxisDataKey])) newItem[xAxisDataKey] = 0;
      if (isNaN(newItem[yAxisDataKey])) newItem[yAxisDataKey] = 0;
      if (isNaN(newItem[sizeKey])) newItem[sizeKey] = 1000; // Default bubble size
      
      return newItem;
    });
  }, [data, xAxisDataKey, yAxisDataKey, sizeKey]);
  
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for bubble chart
      </div>
    );
  }

  // Handle formatter based on config
  const formatter = (value: any, name: string, props: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), name];
    }
    
    // Default formatter
    return [value.toLocaleString(), name];
  };

  // Determine if grid should be shown
  const showGrid = config.showGrid !== false;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        )}
        <XAxis 
          dataKey={xAxisDataKey} 
          name={config.xAxisLabel || xAxisDataKey} 
          tick={{ fontSize: 12 }}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis 
          dataKey={yAxisDataKey} 
          name={config.yAxisLabel || yAxisDataKey} 
          tick={{ fontSize: 12 }}
          padding={{ top: 20, bottom: 20 }}
        />
        <ZAxis 
          dataKey={sizeKey} 
          range={config.zAxisRange || [400, 4000]} 
          name={config.zAxisLabel || sizeKey}
        />
        <Tooltip 
          formatter={formatter}
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        />
        {config.showLegend !== false && <Legend />}
        
        {groups.map((group, index) => (
          <Scatter
            key={group}
            name={config.labels && config.labels[index] ? config.labels[index] : group}
            data={processedData}
            fill={colors[index % colors.length]}
          />
        ))}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default BubbleChart;
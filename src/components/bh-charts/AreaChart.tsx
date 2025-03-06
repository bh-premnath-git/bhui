import React, { useMemo } from "react"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { colorPalettes } from "@/lib/colors"

interface AreaChartProps {
  data: any[]
  xAxisDataKey: string
  areas: string[]
  colors?: string[]
  stacked?: boolean
  config?: Record<string, any> // Additional configuration options
  isMultiSeries?: boolean
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  xAxisDataKey,
  areas,
  colors = colorPalettes.supersetColors,
  stacked = false,
  config = {},
  isMultiSeries = false,
}) => {
  // Convert string values to numbers for chart rendering
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const newItem = { ...item };
      areas.forEach(key => {
        // Remove currency symbols and convert to number
        if (typeof newItem[key] === 'string') {
          // Remove $ and , from values like $12,100
          newItem[key] = Number(newItem[key].replace(/[$,]/g, ''));
        }
        
        // If still not a number, default to 0
        if (isNaN(newItem[key])) {
          newItem[key] = 0;
        }
      });
      return newItem;
    });
  }, [data, areas]);
  
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for area chart
      </div>
    );
  }

  // Get min and max values for better Y axis scaling
  const minMax = useMemo(() => {
    if (!processedData.length) return { min: 0, max: 100 };
    
    let min = Infinity;
    let max = -Infinity;
    
    processedData.forEach(item => {
      areas.forEach(area => {
        const value = Number(item[area]);
        if (!isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });
    
    // Add some padding to the scale
    min = min === Infinity ? 0 : Math.floor(min * 0.9);
    max = max === -Infinity ? 100 : Math.ceil(max * 1.1);
    
    return { min, max };
  }, [processedData, areas]);

  // Handle formatter based on config
  const formatter = (value: any) => {
    // Default number formatter with $ sign
    if (config.valueFormatter) {
      return [config.valueFormatter(value), ""];
    }
    
    // Default to dollar formatter
    return [`$${Number(value).toLocaleString()}`, ""];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsAreaChart 
        data={processedData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey={xAxisDataKey} 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={[minMax.min, minMax.max]}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={formatter}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        />
        <Legend />
        {areas.map((area, index) => (
          <Area
            key={area}
            type="monotone"
            dataKey={area}
            name={config.labels && config.labels[index] ? config.labels[index] : area}
            fill={colors[index % colors.length]}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            stackId={stacked ? "1" : undefined}
            fillOpacity={0.6}
            isAnimationActive={true}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

export default AreaChart

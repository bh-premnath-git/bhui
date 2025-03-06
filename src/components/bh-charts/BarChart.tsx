import React, { useMemo } from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { colorPalettes } from "@/lib/colors"

interface BarChartProps {
  data: any[]
  xAxisDataKey: string
  bars: string[]
  colors?: string[]
  config?: Record<string, any>
  isMultiSeries?: boolean
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xAxisDataKey, 
  bars, 
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false
}) => {
  // Convert string values to numbers for chart rendering
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const newItem = { ...item };
      bars.forEach(key => {
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
  }, [data, bars]);
  
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for bar chart
      </div>
    );
  }

  // Get min and max values for better Y axis scaling
  const minMax = useMemo(() => {
    if (!processedData.length) return { min: 0, max: 100 };
    
    let min = Infinity;
    let max = -Infinity;
    
    processedData.forEach(item => {
      bars.forEach(bar => {
        const value = Number(item[bar]);
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
  }, [processedData, bars]);

  // Handle formatter based on config
  const formatter = (value: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), ""];
    }
    
    // Default to dollar formatter
    return [`$${Number(value).toLocaleString()}`, ""];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart 
        data={processedData} 
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
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
        {bars.map((bar, index) => (
          <Bar 
            key={bar} 
            dataKey={bar}
            name={config.labels && config.labels[index] ? config.labels[index] : bar}
            fill={colors[index % colors.length]} 
            radius={[4, 4, 0, 0]} // Rounded top corners
            isAnimationActive={true}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export default BarChart
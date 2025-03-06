import React, { useMemo } from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area
} from "recharts"
import { colorPalettes } from "@/lib/colors"

interface LineChartProps {
  data: any[]
  xAxisDataKey: string
  lines: string[]
  colors?: string[]
  config?: Record<string, any>
  isMultiSeries?: boolean
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  xAxisDataKey, 
  lines, 
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false
}) => {
  // Convert string values to numbers for chart rendering
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const newItem = { ...item };
      lines.forEach(key => {
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
  }, [data, lines]);
  
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for line chart
      </div>
    );
  }

  // Get min and max values for better Y axis scaling
  const minMax = useMemo(() => {
    if (!processedData.length) return { min: 0, max: 100 };
    
    let min = Infinity;
    let max = -Infinity;
    
    processedData.forEach(item => {
      lines.forEach(line => {
        const value = Number(item[line]);
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
  }, [processedData, lines]);

  // Handle formatter based on config
  const formatter = (value: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), ""];
    }
    
    // Default to dollar formatter
    return [`$${Number(value).toLocaleString()}`, ""];
  };
  
  // Determine if we should use Areas instead of Lines
  const showArea = config.showArea === true;
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart 
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
        <Legend iconSize={6} />
        
        {lines.map((line, index) => (
          showArea ? (
            <Area
              key={line}
              type="monotone"
              dataKey={line}
              name={config.labels && config.labels[index] ? config.labels[index] : line}
              stroke={colors[index % colors.length]}
              fill={`${colors[index % colors.length]}33`} // 33 is 20% opacity in hex
              strokeWidth={2}
              isAnimationActive={true}
            />
          ) : (
            <Line 
              key={line} 
              type="monotone" 
              dataKey={line}
              name={config.labels && config.labels[index] ? config.labels[index] : line}
              stroke={colors[index % colors.length]} 
              strokeWidth={2}
              activeDot={{ r: 6 }} 
              isAnimationActive={true}
            />
          )
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export default LineChart

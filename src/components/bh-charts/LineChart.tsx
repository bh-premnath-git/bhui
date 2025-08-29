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
import { colorPalettes } from "@/components/bh-charts"

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
    
    if (isMultiSeries) {
      // For multi-series, transform nested data structure
      return data.map(item => {
        const newItem: Record<string, any> = {
          [xAxisDataKey]: item[xAxisDataKey]
        };
        
        lines.forEach(line => {
          if (typeof item[line] === 'object' && item[line] !== null) {
            Object.entries(item[line]).forEach(([key, value]) => {
              const processedValue = typeof value === 'string' 
                ? Number(value.replace(/[$,]/g, '')) 
                : Number(value);
              newItem[`${line}_${key}`] = isNaN(processedValue) ? 0 : processedValue;
            });
          }
        });
        
        return newItem;
      });
    }
    
    // Single series processing
    return data.map(item => {
      const newItem = { ...item };
      lines.forEach(key => {
        if (typeof newItem[key] === 'string') {
          newItem[key] = Number(newItem[key].replace(/[$,]/g, ''));
        }
        if (isNaN(newItem[key])) {
          newItem[key] = 0;
        }
      });
      return newItem;
    });
  }, [data, lines, xAxisDataKey, isMultiSeries]);
  
  // Get all line keys for multi-series data
  const allLineKeys = useMemo(() => {
    if (!isMultiSeries) return lines;
    
    const keys: string[] = [];
    lines.forEach(line => {
      if (data[0]?.[line] && typeof data[0][line] === 'object') {
        Object.keys(data[0][line]).forEach(key => {
          keys.push(`${line}_${key}`);
        });
      }
    });
    return keys;
  }, [data, lines, isMultiSeries]);
  
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
      allLineKeys.forEach(line => {
        const value = Number(item[line]);
        if (!isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });
    
    min = min === Infinity ? 0 : Math.floor(min * 0.9);
    max = max === -Infinity ? 100 : Math.ceil(max * 1.1);
    
    return { min, max };
  }, [processedData, allLineKeys]);

  // Handle formatter based on config
  const formatter = (value: any, name: string) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), name];
    }
    
    // Default to dollar formatter
    return [`${Number(value).toLocaleString()}`, name];
  };
  
  // Get display name for a line
  const getLineName = (line: string, index: number) => {
    if (config.labels?.[index]) return config.labels[index];
    if (isMultiSeries) {
      const [group, metric] = line.split('_');
      return `${group} - ${metric}`;
    }
    return line;
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
        
        {allLineKeys.map((line, index) => (
          showArea ? (
            <Area
              key={line}
              type="monotone"
              dataKey={line}
              name={getLineName(line, index)}
              stroke={colors[index % colors.length]}
              fill={`${colors[index % colors.length]}33`}
              strokeWidth={config.strokeWidth || 2}
              dot={{ r: config.dotRadius || 4 }}
              activeDot={{ r: (config.dotRadius || 4) + 2 }} 
              isAnimationActive={config.isAnimationActive !== false}
            />
          ) : (
            <Line 
              key={line} 
              type="monotone" 
              dataKey={line}
              name={getLineName(line, index)}
              stroke={colors[index % colors.length]} 
              strokeWidth={config.strokeWidth || 2}
              dot={{ r: config.dotRadius || 4 }}
              activeDot={{ r: (config.dotRadius || 4) + 2 }} 
              isAnimationActive={config.isAnimationActive !== false}
            />
          )
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export default LineChart

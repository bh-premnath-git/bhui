import React, { useMemo } from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { colorPalettes } from "@/components/bh-charts"

interface BarChartProps {
  data: any[]
  xAxisDataKey: string
  bars: string[]
  colors?: string[]
  config?: Record<string, any>
  isMultiSeries?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xAxisDataKey, 
  bars, 
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false,
  xAxisLabel,
  yAxisLabel
}) => {
  // Convert string values to numbers for chart rendering
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const newItem = { ...item };
      bars.forEach(key => {
        if (isMultiSeries && typeof item[key] === 'object') {
          // Handle multidimensional data where each bar is an object with multiple series
          Object.entries(item[key]).forEach(([series, value]) => {
            // Create a new key combining bar and series name
            const seriesKey = `${key}_${series}`;
            newItem[seriesKey] = typeof value === 'string' 
              ? Number(value.replace(/[$,]/g, ''))
              : Number(value);

            if (isNaN(newItem[seriesKey])) {
              newItem[seriesKey] = 0;
            }
          });
        } else {
          // Handle single series data
          if (typeof newItem[key] === 'string') {
            newItem[key] = Number(newItem[key].replace(/[$,]/g, ''));
          }
          
          if (isNaN(newItem[key])) {
            newItem[key] = 0;
          }
        }
      });
      return newItem;
    });
  }, [data, bars, isMultiSeries]);
  
  // Get all series keys for multidimensional data
  const seriesKeys = useMemo(() => {
    if (!isMultiSeries) return bars;
    
    const keys: string[] = [];
    bars.forEach(bar => {
      if (data[0] && typeof data[0][bar] === 'object') {
        Object.keys(data[0][bar]).forEach(series => {
          keys.push(`${bar}_${series}`);
        });
      } else {
        keys.push(bar);
      }
    });
    return keys;
  }, [data, bars, isMultiSeries]);

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
      seriesKeys.forEach(key => {
        const value = Number(item[key]);
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
  }, [processedData, seriesKeys]);

  // Handle formatter based on config
  const formatter = (value: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), ""];
    }
    
    // Default to dollar formatter
    return [`${Number(value).toLocaleString()}`, ""];
  };

  // Get display name for a series key
  const getSeriesDisplayName = (key: string) => {
    if (!isMultiSeries) {
      return config.labels?.[bars.indexOf(key)] || key;
    }
    
    const [bar, series] = key.split('_');
    const barIndex = bars.indexOf(bar);
    const seriesLabel = config.labels?.[barIndex]?.[series] || series;
    return `${config.labels?.[barIndex]?.name || bar} - ${seriesLabel}`;
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
          label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
        />
        <YAxis 
          domain={[minMax.min, minMax.max]}
          tick={{ fontSize: 12 }}
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: -5 }}
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
        {seriesKeys.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key}
            name={getSeriesDisplayName(key)}
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
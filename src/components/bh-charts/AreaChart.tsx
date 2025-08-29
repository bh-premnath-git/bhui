import React, { useMemo } from "react"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { colorPalettes } from "@/components/bh-charts"

interface AreaChartProps {
  data: any[]
  xAxisDataKey: string
  areas: string[]
  colors?: string[]
  stacked?: boolean
  config?: Record<string, any>
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
        if (isMultiSeries && typeof item[key] === 'object') {
          // Handle multidimensional data where each area is an object with multiple series
          Object.entries(item[key]).forEach(([series, value]) => {
            // Create a new key combining area and series name
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
  }, [data, areas, isMultiSeries]);
  
  // Get all series keys for multidimensional data
  const seriesKeys = useMemo(() => {
    if (!isMultiSeries) return areas;
    
    const keys: string[] = [];
    areas.forEach(area => {
      if (data[0] && typeof data[0][area] === 'object') {
        Object.keys(data[0][area]).forEach(series => {
          keys.push(`${area}_${series}`);
        });
      } else {
        keys.push(area);
      }
    });
    return keys;
  }, [data, areas, isMultiSeries]);

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
    // Default number formatter with $ sign
    if (config.valueFormatter) {
      return [config.valueFormatter(value), ""];
    }
    
    // Default to dollar formatter
    return [`${Number(value).toLocaleString()}`, ""];
  };

  // Get display name for a series key
  const getSeriesDisplayName = (key: string) => {
    if (!isMultiSeries) {
      return config.labels?.[areas.indexOf(key)] || key;
    }
    
    const [area, series] = key.split('_');
    const areaIndex = areas.indexOf(area);
    const seriesLabel = config.labels?.[areaIndex]?.[series] || series;
    return `${config.labels?.[areaIndex]?.name || area} - ${seriesLabel}`;
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
        {seriesKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={getSeriesDisplayName(key)}
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

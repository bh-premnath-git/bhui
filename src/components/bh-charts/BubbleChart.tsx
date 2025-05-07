import React, { useMemo } from "react"
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { colorPalettes } from "@/components/bh-charts"

interface BubbleChartProps {
  data: any[];
  xAxisDataKey: string;
  yAxisDataKey: string;
  sizeKey: string;
  groups?: string[];
  colors?: string[];
  config?: Record<string, any>;
  isMultiSeries?: boolean;
}

type ProcessedDataItem = Record<string, number | string>;
type GroupData = Record<string, ProcessedDataItem[]>;

export const BubbleChart: React.FC<BubbleChartProps> = ({ 
  data, 
  xAxisDataKey,
  yAxisDataKey,
  sizeKey,
  groups = [],
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false
}) => {
  // Define the processValue function BEFORE using it
  const processValue = (value: any): number => {
    if (typeof value === 'string') {
      // Try to convert string to number, removing currency symbols etc.
      return Number(value.replace(/[$,]/g, ''));
    }
    return typeof value === 'number' ? value : 0;
  };

  // Now use processValue in the useMemo hook
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (isMultiSeries) {
      // Group data by series
      const groupedData: Record<string, any[]> = {};
      
      data.forEach((item) => {
        const group = String(item.series || 'default');
        if (!groupedData[group]) {
          groupedData[group] = [];
        }
        
        groupedData[group].push({
          x: processValue(item[xAxisDataKey]),
          y: processValue(item[yAxisDataKey]),
          z: processValue(item[sizeKey]),
          name: item.name || '',
          ...item // Keep other properties for tooltip
        });
      });
      
      return Object.entries(groupedData).map(([key, items]) => ({
        name: key,
        data: items
      }));
    } else {
      // Single series data
      return [{
        name: 'Values',
        data: data.map(item => ({
          x: processValue(item[xAxisDataKey]),
          y: processValue(item[yAxisDataKey]),
          z: processValue(item[sizeKey]),
          name: item.name || '',
          ...item // Keep other properties for tooltip
        }))
      }];
    }
  }, [data, xAxisDataKey, yAxisDataKey, sizeKey, isMultiSeries]);

  // Calculate the domain for the z-axis (bubble size)
  const zDomain = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    
    processedData.forEach(series => {
      series.data.forEach((item: any) => {
        if (item.z < min) min = item.z;
        if (item.z > max) max = item.z;
      });
    });
    
    return [min === Infinity ? 0 : min, max === -Infinity ? 100 : max];
  }, [processedData]);

  // Configure bubble size range
  const bubbleSizeRange = [
    config.minBubbleSize || 5,
    config.maxBubbleSize || 30
  ];

  // No data check
  if (!processedData.length || processedData[0].data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for bubble chart
      </div>
    );
  }

  // Handle formatter based on config
  const formatter = (value: any, name: string, _props: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), name];
    }
    
    // Default formatter
    return [value.toLocaleString(), name];
  };

  // Get display name for a group
  const getGroupDisplayName = (group: string, index: number) => {
    if (!isMultiSeries) {
      return config.labels?.[index] || group;
    }
    
    return config.labels?.[index]?.name || group;
  };

  // Get data for a specific group
  const getGroupData = (group: string) => {
    if (isMultiSeries) {
      return (processedData as unknown as GroupData)[group] || [];
    }
    return (processedData as unknown as ProcessedDataItem[]);
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
          type="number" 
          dataKey="x" 
          name={config.xAxisLabel || xAxisDataKey} 
          tickFormatter={config.xAxisFormatter}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name={config.yAxisLabel || yAxisDataKey} 
          tickFormatter={config.yAxisFormatter}
        />
        <ZAxis 
          type="number" 
          dataKey="z" 
          range={bubbleSizeRange} 
          domain={zDomain}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name, props) => {
            if (name === 'x') return [value, config.xAxisLabel || xAxisDataKey];
            if (name === 'y') return [value, config.yAxisLabel || yAxisDataKey];
            if (name === 'z') return [value, config.sizeLabel || sizeKey];
            return [value, name];
          }}
        />
        {config.showLegend !== false && <Legend />}
    
        {processedData.map((series, index) => (
          <Scatter
            key={`series-${index}`}
            name={series.name}
            data={series.data}
            fill={colors[index % colors.length]}
            opacity={config.bubbleOpacity || 0.7}
          />
        ))}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default BubbleChart;
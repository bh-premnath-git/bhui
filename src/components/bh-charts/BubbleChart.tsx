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
import { colorPalettes } from "@/components/bh-charts"

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

type ProcessedDataItem = Record<string, number | string>;
type GroupData = Record<string, ProcessedDataItem[]>;

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
  // Process data for single and multi-series
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return isMultiSeries ? {} as GroupData : [] as ProcessedDataItem[];

    if (isMultiSeries) {
      // For multi-series, we need to create separate datasets for each group
      const groupData: GroupData = {};
      
      data.forEach(item => {
        groups.forEach(group => {
          if (!groupData[group]) {
            groupData[group] = [];
          }

          if (typeof item[group] === 'object' && item[group] !== null) {
            // Extract x, y, and size values from the nested object
            const seriesData: ProcessedDataItem = {
              [xAxisDataKey]: processValue(item[group][xAxisDataKey]),
              [yAxisDataKey]: processValue(item[group][yAxisDataKey]),
              [sizeKey]: processValue(item[group][sizeKey], 1000),
              name: item.name || item[xAxisDataKey], // Preserve name for tooltip
            };
            groupData[group].push(seriesData);
          }
        });
      });

      return groupData;
    }
    
    // Single series processing
    return data.map(item => ({
      ...item,
      [xAxisDataKey]: processValue(item[xAxisDataKey]),
      [yAxisDataKey]: processValue(item[yAxisDataKey]),
      [sizeKey]: processValue(item[sizeKey], 1000),
    })) as ProcessedDataItem[];
  }, [data, xAxisDataKey, yAxisDataKey, sizeKey, groups, isMultiSeries]);

  // Helper function to process numeric values
  const processValue = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'string') {
      const processed = Number(value.replace(/[$,]/g, ''));
      return isNaN(processed) ? defaultValue : processed;
    }
    return typeof value === 'number' ? value : defaultValue;
  };
  
  if (!processedData || (isMultiSeries ? Object.keys(processedData).length === 0 : processedData.length === 0)) {
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
  const getGroupData = (group: string): ProcessedDataItem[] => {
    if (isMultiSeries) {
      return (processedData as GroupData)[group] || [];
    }
    return processedData as ProcessedDataItem[];
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
            name={getGroupDisplayName(group, index)}
            data={getGroupData(group)}
            fill={colors[index % colors.length]}
          />
        ))}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default BubbleChart;
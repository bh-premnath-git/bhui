import React, { useMemo } from "react"
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { colorPalettes } from "@/components/bh-charts"

interface PieChartData {
  name: string;
  value: number | string;
  color?: string;
  [key: string]: string | number | undefined;
}

interface PieChartProps {
  data: PieChartData[] | Record<string, PieChartData[]>;
  dataKey: string;
  nameKey: string;
  colors?: string[];
  config?: Record<string, any>;
  isMultiSeries?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  dataKey, 
  nameKey, 
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false
}) => {
  // Process data for single and multi-series
  const processedData = useMemo(() => {
    if (!data || (Array.isArray(data) && data.length === 0)) return [];
    
    if (isMultiSeries && !Array.isArray(data)) {
      // For multi-series, combine all series into a single dataset
      const combinedData: PieChartData[] = [];
      Object.entries(data).forEach(([series, items]) => {
        items.forEach(item => {
          const value = typeof item[dataKey] === 'string' 
            ? Number(item[dataKey].toString().replace(/[$,]/g, ''))
            : Number(item[dataKey]);
            
          combinedData.push({
            name: `${series} - ${item[nameKey]}`,
            value: isNaN(value) ? 0 : value,
            series // Keep track of the series for coloring
          });
        });
      });
      return combinedData;
    }
    
    // Single series processing
    return (data as PieChartData[]).map(item => {
      const value = typeof item[dataKey] === 'string'
        ? Number(item[dataKey].toString().replace(/[$,]/g, ''))
        : Number(item[dataKey]);
        
      return {
        ...item,
        [dataKey]: isNaN(value) ? 0 : value
      };
    });
  }, [data, dataKey, nameKey, isMultiSeries]);
    
  // Don't render the chart if no data or all zero values
  if (!processedData.length || processedData.every(item => item[dataKey] === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No valid data for pie chart
      </div>
    );
  }

  // Get color for a cell
  const getCellColor = (entry: PieChartData, index: number) => {
    if (entry.color) return entry.color;
    if (isMultiSeries && entry.series) {
      // Use the same color for all items in the same series
      const seriesIndex = Object.keys(data).indexOf(entry.series as string);
      return colors[seriesIndex % colors.length];
    }
    return colors[index % colors.length];
  };

  // Configure formatter based on config
  const formatter = (value: any, name: string) => {
    const formattedValue = config.valueFormatter 
      ? config.valueFormatter(value)
      : `${Number(value).toLocaleString()}`;
    
    return [formattedValue, name];
  };

  // Determine whether to show labels based on config
  const showLabels = config.showLabels !== false;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={config.innerRadius !== undefined ? config.innerRadius : 0}
          outerRadius={config.outerRadius || 80}
          fill="#8884d8"
          paddingAngle={config.paddingAngle !== undefined ? config.paddingAngle : 0}
          dataKey={dataKey}
          nameKey={nameKey}
          labelLine={showLabels}
          label={showLabels ? 
            ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : 
            false
          }
          isAnimationActive={true}
        >
          {processedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getCellColor(entry, index)}
              stroke={config.cellStroke || "#fff"}
              strokeWidth={config.cellStrokeWidth || 1}
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={formatter}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

export default PieChart

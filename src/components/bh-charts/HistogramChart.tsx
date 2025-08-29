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
import { colorPalettes } from "@/components/bh-charts"

interface HistogramChartProps {
  data: Array<number | string>;
  bins?: number;
  color?: string;
  config?: Record<string, any>;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ 
  data, 
  bins = 10,
  color = colorPalettes.supersetColors[0],
  config = {}
}) => {
  // Process data and calculate histogram
  const histogramData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Convert string values to numbers if needed
    const numericData = data.map(value => {
      if (typeof value === 'string') {
        return Number(value.replace(/[$,]/g, ''));
      }
      return value;
    }).filter(value => !isNaN(value));

    if (numericData.length === 0) {
      return [];
    }

    // Calculate histogram data
    const min = Math.min(...numericData);
    const max = Math.max(...numericData);
    const binWidth = (max - min) / bins;
    
    return Array.from({ length: bins }, (_, i) => {
      const binStart = min + (i * binWidth);
      const binEnd = binStart + binWidth;
      const count = numericData.filter(v => v >= binStart && (v < binEnd || i === bins - 1)).length;
      
      // Round bin edges for better display
      const formattedBinStart = Math.round(binStart * 100) / 100;
      const formattedBinEnd = Math.round(binEnd * 100) / 100;
      
      return {
        bin: `${formattedBinStart}-${formattedBinEnd}`,
        count
      };
    });
  }, [data, bins]);

  if (!histogramData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for histogram
      </div>
    );
  }

  // Handle formatter based on config
  const formatter = (value: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), "Frequency"];
    }
    
    // Default formatter
    return [value.toLocaleString(), "Frequency"];
  };

  // Determine if grid should be shown
  const showGrid = config.showGrid !== false;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart 
        data={histogramData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        )}
        <XAxis 
          dataKey="bin" 
          tick={{ fontSize: 12 }}
          label={config.xAxisLabel ? { value: config.xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={config.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip 
          formatter={formatter}
          labelFormatter={(label: string) => `Range: ${label}`}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        />
        {config.showLegend && <Legend />}
        <Bar 
          dataKey="count" 
          fill={color} 
          name={config.barName || "Frequency"}
          radius={config.roundedBars !== false ? [4, 4, 0, 0] : [0, 0, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default HistogramChart;
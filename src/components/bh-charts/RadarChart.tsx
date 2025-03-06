import React, { useMemo } from "react"
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { colorPalettes } from "@/lib/colors"

interface RadarChartProps {
  data: any[];
  variables: string[];
  groups: string[];
  colors?: string[];
  config?: Record<string, any>;
  isMultiSeries?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  variables,
  groups,
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false
}) => {
  // Process and validate data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Convert string values to numbers
    return data.map(item => {
      const newItem = { ...item };
      groups.forEach(group => {
        if (typeof newItem[group] === 'string') {
          newItem[group] = Number(newItem[group].replace(/[$,]/g, ''));
        }
        
        // If still not a number, default to 0
        if (isNaN(newItem[group])) {
          newItem[group] = 0;
        }
      });
      return newItem;
    });
  }, [data, groups]);

  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for radar chart
      </div>
    );
  }

  // Handle formatter based on config
  const formatter = (value: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), ""];
    }
    
    // Default formatter
    return [value.toLocaleString(), ""];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart 
        cx="50%" 
        cy="50%" 
        outerRadius="80%" 
        data={processedData}
      >
        <PolarGrid stroke="#e5e5e5" />
        <PolarAngleAxis dataKey="variable" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis tickCount={5} />
        
        {groups.map((group, index) => (
          <Radar
            key={group}
            name={config.labels && config.labels[index] ? config.labels[index] : group}
            dataKey={group}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={config.fillOpacity || 0.2}
            strokeWidth={2}
          />
        ))}
        
        <Tooltip 
          formatter={formatter}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        />
        {config.showLegend !== false && <Legend />}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;
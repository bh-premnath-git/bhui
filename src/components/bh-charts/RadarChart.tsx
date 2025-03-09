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
import { colorPalettes } from "@/components/bh-charts"

interface RadarChartData {
  variable: string;
  [key: string]: string | number;
}

interface RadarChartProps {
  data: RadarChartData[] | Record<string, RadarChartData[]>;
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
    if (!data || (Array.isArray(data) && data.length === 0)) return [];
    
    if (isMultiSeries && !Array.isArray(data)) {
      // For multi-series, transform data to combine all series
      const combinedData: RadarChartData[] = variables.map(variable => {
        const newItem: RadarChartData = { variable };
        
        // Process each group's data for this variable
        groups.forEach(group => {
          Object.entries(data).forEach(([series, items]) => {
            const item = items.find(i => i.variable === variable);
            if (item) {
              const value = typeof item[group] === 'string'
                ? Number(item[group].toString().replace(/[$,]/g, ''))
                : Number(item[group]);
              newItem[`${series}_${group}`] = isNaN(value) ? 0 : value;
            }
          });
        });
        
        return newItem;
      });
      
      return combinedData;
    }
    
    // Single series processing
    return (data as RadarChartData[]).map(item => {
      const newItem = { ...item };
      groups.forEach(group => {
        if (typeof newItem[group] === 'string') {
          newItem[group] = Number(newItem[group].replace(/[$,]/g, ''));
        }
        if (isNaN(newItem[group])) {
          newItem[group] = 0;
        }
      });
      return newItem;
    });
  }, [data, variables, groups, isMultiSeries]);

  // Get all radar keys for multi-series data
  const radarKeys = useMemo(() => {
    if (!isMultiSeries) return groups;
    
    const keys: string[] = [];
    if (!Array.isArray(data)) {
      Object.keys(data).forEach(series => {
        groups.forEach(group => {
          keys.push(`${series}_${group}`);
        });
      });
    }
    return keys;
  }, [data, groups, isMultiSeries]);

  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for radar chart
      </div>
    );
  }

  // Get display name for a radar
  const getRadarName = (key: string, index: number) => {
    if (config.labels?.[index]) return config.labels[index];
    if (isMultiSeries) {
      const [series, group] = key.split('_');
      return `${series} - ${group}`;
    }
    return key;
  };

  // Handle formatter based on config
  const formatter = (value: any, name: string) => {
    const displayName = isMultiSeries ? name.split('_')[1] : name;
    
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), displayName];
    }
    
    // Default formatter
    return [value.toLocaleString(), displayName];
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
        
        {radarKeys.map((key, index) => (
          <Radar
            key={key}
            name={getRadarName(key, index)}
            dataKey={key}
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
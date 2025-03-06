import React, { useMemo } from "react"
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { colorPalettes } from "@/lib/colors"

interface PieChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  colors?: string[]
  config?: Record<string, any>
  isMultiSeries?: boolean
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  dataKey, 
  nameKey, 
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false
}) => {
  // Ensure data is properly formatted for the pie chart
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const newItem = { ...item };
      
      // Make sure the value is a number
      if (typeof newItem[dataKey] === 'string') {
        // Remove $ and , from values like $12,100
        newItem[dataKey] = Number(newItem[dataKey].replace(/[$,]/g, ''));
      }
      
      // If still not a number, default to 0
      if (isNaN(newItem[dataKey])) {
        newItem[dataKey] = 0;
      }
      
      return newItem;
    });
  }, [data, dataKey]);
  
  console.log("PieChart rendering with processed data:", processedData);
  
  // Don't render the chart if no data or all zero values
  if (!processedData.length || processedData.every(item => item[dataKey] === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No valid data for pie chart
      </div>
    );
  }

  // Determine whether to show labels based on config
  const showLabels = config.showLabels !== false;
  
  // Configure formatter based on config
  const formatter = (value: any) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), ""];
    }
    
    // Default to dollar formatter
    return [`$${Number(value).toLocaleString()}`, ""];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={config.innerRadius || 60}
          outerRadius={config.outerRadius || 80}
          fill="#8884d8"
          paddingAngle={config.paddingAngle || 5}
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
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

export default PieChart

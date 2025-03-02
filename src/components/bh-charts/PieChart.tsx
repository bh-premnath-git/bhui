import type React from "react"
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { COLORS } from "@/lib/colors"

interface PieChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  colors?: string[]
}

export const PieChart: React.FC<PieChartProps> = ({ data, dataKey, nameKey, colors = COLORS }) => {
  // Ensure data is properly formatted for the pie chart
  const processedData = data.map(item => {
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
  
  console.log("PieChart rendering with processed data:", processedData);
  
  // Don't render the chart if no data or all zero values
  if (!processedData.length || processedData.every(item => item[dataKey] === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No valid data for pie chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey={dataKey}
          nameKey={nameKey}
          label={(entry) => entry[nameKey]}
          isAnimationActive={true}
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}


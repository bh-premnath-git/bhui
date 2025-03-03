import type React from "react"
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
import { COLORS } from "@/lib/colors"

interface BarChartProps {
  data: any[]
  xAxisDataKey: string
  bars: string[]
  colors?: string[]
}

export const BarChart: React.FC<BarChartProps> = ({ data, xAxisDataKey, bars, colors = COLORS }) => {
  // Convert string values to numbers for chart rendering
  const processedData = data.map(item => {
    const newItem = { ...item };
    bars.forEach(key => {
      // Remove currency symbols and convert to number
      if (typeof newItem[key] === 'string') {
        // Remove $ and , from values like $12,100
        newItem[key] = Number(newItem[key].replace(/[$,]/g, ''));
      }
    });
    return newItem;
  });
  
  console.log("BarChart rendering with processed data:", processedData);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
        <Legend />
        {bars.map((bar, index) => (
          <Bar 
            key={bar} 
            dataKey={bar} 
            fill={colors[index % colors.length]} 
            isAnimationActive={true}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
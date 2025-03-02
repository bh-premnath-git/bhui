import type React from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { COLORS } from "@/lib/colors"

interface LineChartProps {
  data: any[]
  xAxisDataKey: string
  lines: string[]
  colors?: string[]
}

export const LineChart: React.FC<LineChartProps> = ({ data, xAxisDataKey, lines, colors = COLORS }) => {
  // Convert string values to numbers for chart rendering
  const processedData = data.map(item => {
    const newItem = { ...item };
    lines.forEach(key => {
      // Remove currency symbols and convert to number
      if (typeof newItem[key] === 'string') {
        // Remove $ and , from values like $12,100
        newItem[key] = Number(newItem[key].replace(/[$,]/g, ''));
      }
    });
    return newItem;
  });
  
  console.log("LineChart rendering with processed data:", processedData);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
        <Legend iconSize={6} />
        {lines.map((line, index) => (
          <Line 
            key={line} 
            type="monotone" 
            dataKey={line} 
            stroke={colors[index % colors.length]} 
            activeDot={{ r: 8 }} 
            isAnimationActive={true}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}


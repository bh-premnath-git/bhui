import type React from "react"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { colorPalettes } from "@/lib/colors"

interface AreaChartProps {
  data: any[]
  xAxisDataKey: string
  areas: string[]
  colors?: string[]
  stacked?: boolean
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  xAxisDataKey,
  areas,
  colors = colorPalettes.supersetColors,
  stacked = false,
}) => {
  // Convert string values to numbers for chart rendering
  const processedData = data.map(item => {
    const newItem = { ...item };
    areas.forEach(key => {
      // Remove currency symbols and convert to number
      if (typeof newItem[key] === 'string') {
        // Remove $ and , from values like $12,100
        newItem[key] = Number(newItem[key].replace(/[$,]/g, ''));
      }
      
      // If still not a number, default to 0
      if (isNaN(newItem[key])) {
        newItem[key] = 0;
      }
    });
    return newItem;
  });
  
  console.log("AreaChart rendering with processed data:", processedData);
  
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for area chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsAreaChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
        <Legend />
        {areas.map((area, index) => (
          <Area
            key={area}
            type="monotone"
            dataKey={area}
            fill={colors[index % colors.length]}
            stroke={colors[index % colors.length]}
            stackId={stacked ? "1" : undefined}
            fillOpacity={0.6}
            isAnimationActive={true}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

export default AreaChart

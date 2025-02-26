import type React from "react"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsAreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip />
        {areas.map((area, index) => (
          <Area
            key={area}
            type="monotone"
            dataKey={area}
            fill={colors[index % colors.length]}
            stroke={colors[index % colors.length]}
            stackId={stacked ? "1" : undefined}
            fillOpacity={0.6}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

export default AreaChart

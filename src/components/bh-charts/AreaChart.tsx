import type React from "react"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { COLORS } from "@/lib/colors"

interface AreaChartProps {
  data: any[]
  xAxisDataKey: string
  areas: string[]
}

export const AreaChart: React.FC<AreaChartProps> = ({ data, xAxisDataKey, areas }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisDataKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {areas.map((area, index) => (
        <Area
          key={area}
          type="monotone"
          dataKey={area}
          stackId="1"
          stroke={COLORS[index % COLORS.length]}
          fill={COLORS[index % COLORS.length]}
          fillOpacity={1}
          strokeWidth={2}
        />
      ))}
    </RechartsAreaChart>
  </ResponsiveContainer>
)

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

export const BarChart: React.FC<BarChartProps> = ({ data, xAxisDataKey, bars, colors }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisDataKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {bars.map((bar, index) => (
        <Bar key={bar} dataKey={bar} fill={colors?.[index % (colors?.length || COLORS.length)]} />
      ))}
    </RechartsBarChart>
  </ResponsiveContainer>
)
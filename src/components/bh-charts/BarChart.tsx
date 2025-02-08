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
}

export const BarChart: React.FC<BarChartProps> = ({ data, xAxisDataKey, bars }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisDataKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {bars.map((bar, index) => (
        <Bar key={bar} dataKey={bar} fill={COLORS[index % COLORS.length]} />
      ))}
    </RechartsBarChart>
  </ResponsiveContainer>
)
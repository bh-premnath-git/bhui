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
}

export const LineChart: React.FC<LineChartProps> = ({ data, xAxisDataKey, lines }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisDataKey} />
      <YAxis />
      <Tooltip />
      <Legend iconSize={6} />
      {lines.map((line, index) => (
        <Line key={line} type="monotone" dataKey={line} stroke={COLORS[index % COLORS.length]} activeDot={{ r: 8 }} />
      ))}
    </RechartsLineChart>
  </ResponsiveContainer>
)


import type { FC } from "react"
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { COLORS } from "@/lib/colors"

interface ScatterChartProps {
  data: Array<{ x: number; y: number }>;
  xKey: string;
  yKey: string;
  /** Optional: Provide a name (for Legend, Tooltip, etc.) */
  name?: string;
  /** Width and height can be numbers or percentages */
  width?: number | string;
  height?: number | string;
}

export const ScatterChart: FC<ScatterChartProps> = ({
  data,
  xKey,
  yKey,
  name = "Series 1",
  width = "100%",
  height = 300,
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {/* X-axis */}
        <XAxis 
          dataKey={xKey}
          name={xKey}
          stroke="#8884d8"
          tickLine={false}
          padding={{ left: 20, right: 20 }}
        />
        
        {/* Y-axis */}
        <YAxis 
          dataKey={yKey} 
          name={yKey} 
          stroke="#8884d8"
          tickLine={false}
          padding={{ top: 20, bottom: 20 }} 
        />

        {/* Tooltip & Legend */}
        <Tooltip />
        <Legend />

        {/* The Scatter series */}
        <Scatter name={name} data={data}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Scatter>
      </RechartsScatterChart>
    </ResponsiveContainer>
  )
}

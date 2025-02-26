import type React from "react"
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { COLORS } from "@/lib/colors"

interface PieChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  colors?: string[]
}

export const PieChart: React.FC<PieChartProps> = ({ data, dataKey, nameKey, colors }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsPieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        fill="#8884d8"
        paddingAngle={5}
        dataKey={dataKey}
        nameKey={nameKey}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors?.[index % (colors?.length || 1)]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </RechartsPieChart>
  </ResponsiveContainer>
)


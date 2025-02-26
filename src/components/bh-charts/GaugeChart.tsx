import type React from "react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"

interface GaugeChartProps {
  value: number;
  min: number;
  max: number;
  color?: string;
  label?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ 
  value, 
  min, 
  max, 
  color = '#4B9EFF',
  label 
}) => {
  const normalizedValue = ((value - min) / (max - min)) * 100;
  const data = [
    { value: normalizedValue },
    { value: 100 - normalizedValue }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
        >
          <Cell fill={color} />
          <Cell fill="#f3f4f6" />
        </Pie>
        {label && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium"
          >
            {label}
          </text>
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default GaugeChart; 
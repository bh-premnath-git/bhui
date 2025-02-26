import type React from "react"
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface BubbleChartProps {
  data: any[];
  xAxisDataKey: string;
  yAxisDataKey: string;
  sizeKey: string;
  groups: string[];
  colors?: string[];
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ 
  data, 
  xAxisDataKey,
  yAxisDataKey,
  sizeKey,
  groups,
  colors = ['#4B9EFF', '#45D483', '#FFB547', '#FF6B6B']
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis dataKey={yAxisDataKey} />
        <Tooltip />
        <Legend />
        {groups.map((group, index) => (
          <Scatter
            key={group}
            name={group}
            data={data}
            fill={colors[index % colors.length]}
          />
        ))}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default BubbleChart; 
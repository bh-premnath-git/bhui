import type React from "react"
import {
  Treemap as RechartsTreemap,
  ResponsiveContainer,
  Tooltip
} from "recharts"

interface TreemapChartProps {
  data: any[];
  dataKey: string;
  colors?: string[];
}

export const TreemapChart: React.FC<TreemapChartProps> = ({ 
  data, 
  dataKey,
  colors = ['#4B9EFF', '#45D483', '#FFB547', '#FF6B6B']
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsTreemap
        data={data}
        dataKey={dataKey}
        aspectRatio={4/3}
        stroke="#fff"
        fill={colors[0]}
      >
        <Tooltip />
      </RechartsTreemap>
    </ResponsiveContainer>
  );
};

export default TreemapChart; 
import type React from "react"
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface RadarChartProps {
  data: any[];
  variables: string[];
  groups: string[];
  colors?: string[];
}

export const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  variables,
  groups,
  colors = ['#4B9EFF', '#45D483', '#FFB547', '#FF6B6B']
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="variable" />
        <PolarRadiusAxis />
        {groups.map((group, index) => (
          <Radar
            key={group}
            name={group}
            dataKey={group}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.6}
          />
        ))}
        <Legend />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart; 
import type React from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface HistogramChartProps {
  data: number[];
  bins?: number;
  color?: string;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ 
  data, 
  bins = 10,
  color = '#4B9EFF'
}) => {
  // Calculate histogram data
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;
  
  const histogramData = Array.from({ length: bins }, (_, i) => {
    const binStart = min + (i * binWidth);
    const binEnd = binStart + binWidth;
    const count = data.filter(v => v >= binStart && v < binEnd).length;
    return {
      bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      count
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={histogramData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bin" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill={color} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default HistogramChart; 
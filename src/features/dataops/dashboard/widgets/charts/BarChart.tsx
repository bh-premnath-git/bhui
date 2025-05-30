import { useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label
} from "recharts";
import { Widget } from "@/types/dataops/dataops-dash";

interface BarChartProps {
  widget: Widget;
  height?: number;
}

export const BarChart = ({ widget }: BarChartProps) => {
  const { chart_config, executed_query } = widget;
  const { xAxis, yAxis, series, metric } = chart_config;

  // Generate colors for each series
  const colors = useMemo(() => {
    return [
      "var(--chart-1-color)", 
      "var(--chart-2-color)", 
      "var(--chart-3-color)", 
      "var(--chart-4-color)", 
      "var(--chart-5-color)"
    ];
  }, []);

  // Generate bars for each series
  const renderBars = () => {
    if (Array.isArray(series)) {
      return series.map((seriesName, index) => {
        const colorIndex = index % colors.length;
        return (
          <Bar
            key={String(seriesName)}
            dataKey={seriesName}
            fill={colors[colorIndex]}
            radius={[3, 3, 0, 0]}
          />
        );
      });
    }
    
    return (
      <Bar
        dataKey={typeof series === 'string' ? series : yAxis}
        fill={colors[0]}
        radius={[3, 3, 0, 0]}
      />
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={executed_query}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis 
            dataKey={xAxis} 
            stroke="hsl(var(--muted-foreground))"
            tick={{ 
              fill: "hsl(var(--muted-foreground))",
              fontSize: 11
            }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            height={40}
            tickMargin={8}
          >
            <Label 
              value={xAxis.charAt(0).toUpperCase() + xAxis.slice(1).replace(/_/g, ' ')}
              position="bottom" 
              offset={5}
              style={{ 
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11
              }}
            />
          </XAxis>
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ 
              fill: "hsl(var(--muted-foreground))",
              fontSize: 11
            }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            width={60}
            tickMargin={8}
          >
            <Label 
              value={metric}
              position="left"
              angle={-90}
              offset={0}
              style={{ 
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
                textAnchor: 'middle'
              }}
            />
          </YAxis>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))", 
              color: "hsl(var(--card-foreground))",
              fontSize: 11,
              borderRadius: 4,
              padding: "8px"
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={24}
            wrapperStyle={{
              fontSize: 11,
              color: "hsl(var(--muted-foreground))"
            }}
          />
          {renderBars()}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
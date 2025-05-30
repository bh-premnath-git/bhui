import { useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label
} from "recharts";
import { Widget } from "@/types/dataops/dataops-dash";

interface LineChartProps {
  widget: Widget;
  height?: number;
}

export const LineChart = ({ widget }: LineChartProps) => {
  const { chart_config, executed_query } = widget;
  const { xAxis, yAxis, metric } = chart_config;

  // Process and deduplicate data for the chart
  const chartData = useMemo(() => {
    const monthMap = new Map();

    executed_query.forEach((item: any) => {
      const monthKey = item[xAxis];

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          [xAxis]: monthKey,
        });
      }

      const entry = monthMap.get(monthKey);
      entry[item.project_name] = parseFloat(item[yAxis]);
    });

    return Array.from(monthMap.values())
      .sort((a, b) => {
        const dateA = new Date(a[xAxis]);
        const dateB = new Date(b[xAxis]);
        return dateA.getTime() - dateB.getTime();
      });
  }, [executed_query, xAxis, yAxis]);

  // Extract unique project names for series
  const projectNames = useMemo(() => {
    const names = new Set<string>();
    executed_query.forEach((item: any) => {
      names.add(item.project_name);
    });
    return Array.from(names);
  }, [executed_query]);

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

  // Generate lines for each project
  const renderLines = () => {
    return projectNames.map((projectName, index) => {
      const colorIndex = index % colors.length;
      return (
        <Line
          key={projectName}
          type="monotone"
          dataKey={projectName}
          name={projectName}
          stroke={colors[colorIndex]}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 2 }}
          activeDot={{ r: 4, strokeWidth: 2 }}
          connectNulls
        />
      );
    });
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={chartData}
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
              value="Time Period"
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
            iconType="square"
            wrapperStyle={{
              fontSize: 11,
              color: "hsl(var(--muted-foreground))"
            }}
          />
          {renderLines()}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
import React, { useState, useMemo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ErrorBoundary } from "react-error-boundary";

type DataItem = {
  name: string;
  project: string;
  pipeline: string;
  latency: number;
  cost: number;
  freshness: number;
  status: "In Progress" | "Completed" | "Failed" | "Did Not Arrive" | "Not Published";
  date: Date;
};

type FilterOption = "All" | string;

interface CustomizedDotProps {
  cx: number;
  cy: number;
  stroke: string;
  payload?: { name: string; [key: string]: any };
  value?: number;
  index?: number;
  dataKey?: string;
  isShow?: boolean;
}

const COLORS = ["#00C49F", "#FFBB28", "#018042", "#FF6B6B", "#8884d8", "#663399"];
const months = ["Jan", "Feb", "Mar", "Apr", "May"];
const projects = ["Project1", "Project2", "Project3", "Project4"];
const pipelines = ["Pipeline1", "Pipeline2", "Pipeline3", "Pipeline4"];

const generateData = (): DataItem[] => {
  return months.flatMap((month, monthIndex) =>
    projects.flatMap((project) =>
      pipelines.map((pipeline) => ({
        name: month,
        project,
        pipeline,
        latency: Math.floor(Math.random() * 40) + 10,
        cost: Math.floor(Math.random() * 1000) + 500,
        freshness: Math.floor(Math.random() * 20) + 80,
        status: ["In Progress", "Completed", "Failed", "Did Not Arrive", "Not Published"][
          Math.floor(Math.random() * 5)
        ] as DataItem["status"],
        date: new Date(2023, monthIndex, 1),
      }))
    )
  );
};

const CustomLegend: React.FC<any> = (props) => {
  const { payload } = props;

  return (
    <ul className="flex flex-wrap justify-center gap-2 text-xs">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          <span
            className="inline-block w-2 h-2 mr-1"
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className="text-black">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const computeAverageMetrics = (
  data: DataItem[],
  metric: keyof Pick<DataItem, "latency" | "cost" | "freshness">
) => {
  return months.map((month, monthIndex) => {
    const monthData = data.filter(
      (item) => item.date.getMonth() === monthIndex
    );
    return {
      name: month,
      ...projects.reduce((acc, proj) => {
        const projectData = monthData.filter((item) => item.project === proj);
        const avg =
          projectData.length > 0
            ? projectData.reduce((sum, item) => sum + item[metric], 0) /
              projectData.length
            : 0;
        acc[proj] = avg;
        return acc;
      }, {} as Record<string, number>),
    };
  });
};

const CustomizedDot: React.FC<CustomizedDotProps> = (props) => {
  const { cx, cy, stroke } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      stroke={stroke}
      strokeWidth={2}
      fill={stroke}
    />
  );
};

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div role="alert" className="text-red-500">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
  </div>
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <Card className="col-span-1">
    <CardHeader>
      <CardTitle className="text-sm">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ResponsiveContainer width="100%" height={230} aria-label={title}>
          {React.isValidElement(children) ? (
            children
          ) : (
            <div>No data available</div>
          )}
        </ResponsiveContainer>
      </ErrorBoundary>
    </CardContent>
  </Card>
);

interface FilterSelectProps {
  label: string;
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  options: string[];
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={`${label.toLowerCase()}-select`} className="w-[130px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option === "All" ? `${label}/All` : `(${option})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default function Component() {
  const [filters, setFilters] = useState({
    project: "All" as FilterOption,
    pipeline: "All" as FilterOption,
    status: "All" as FilterOption,
    duration: "All" as FilterOption,
  });

  const handleFilterChange = useCallback((key: string, value: FilterOption) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const allData = useMemo(() => generateData(), []);

  const filteredData = useMemo(() => {
    let filtered = allData;

    if (filters.project !== "All") {
      filtered = filtered.filter((item) => item.project === filters.project);
    }

    if (filters.pipeline !== "All") {
      filtered = filtered.filter((item) => item.pipeline === filters.pipeline);
    }

    if (filters.status !== "All") {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    if (filters.duration !== "All") {
      const now = new Date();
      const startDate = new Date(now);
      switch (filters.duration) {
        case "Today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "This Week":
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case "This Month":
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
      filtered = filtered.filter((item) => item.date >= startDate);
    }

    return filtered;
  }, [allData, filters]);

  const chartData = useMemo(
    () => ({
      latency: computeAverageMetrics(filteredData, "latency"),
      cost: computeAverageMetrics(filteredData, "cost"),
      freshness: computeAverageMetrics(filteredData, "freshness"),
      health: projects.map((proj) => {
        const projectData = filteredData.filter(
          (item) => item.project === proj
        );
        const total = projectData.length;
        const success = projectData.filter(
          (item) => item.status === "Completed"
        ).length;
        return {
          name: proj,
          success: total > 0 ? (success / total) * 100 : 0,
          failed: total > 0 ? ((total - success) / total) * 100 : 0,
        };
      }),
      quality: projects.map((proj) => {
        const projectData = filteredData.filter(
          (item) => item.project === proj
        );
        const total = projectData.length;
        const success = projectData.filter(
          (item) => item.freshness > 90
        ).length;
        return {
          name: proj,
          success: total > 0 ? (success / total) * 100 : 0,
          failed: total > 0 ? ((total - success) / total) * 100 : 0,
        };
      }),
      incident: projects.map((proj) => {
        const projectData = filteredData.filter(
          (item) => item.project === proj
        );
        return {
          name: proj,
          inProgress: projectData.filter(
            (item) => item.status === "In Progress"
          ).length,
          completed: projectData.filter((item) => item.status === "Completed")
            .length,
          failed: projectData.filter((item) => item.status === "Failed").length,
        };
      }),
      ingestion: (() => {
        const completedOnTime = filteredData.filter(
          (item) => item.status === "Completed"
        ).length;
        const failed = filteredData.filter(
          (item) => item.status === "Failed"
        ).length;
        const delayed = filteredData.filter(
          (item) => item.status === "In Progress"
        ).length;
        const didNotArrive = filteredData.filter(
          (item) => item.status === "Did Not Arrive"
        ).length;
        return [
          { name: "Completed On Time", value: completedOnTime },
          { name: "Completed With Delay", value: delayed },
          { name: "Failed", value: failed },
          { name: "Did Not Arrive", value: didNotArrive },
        ];
      })(),
      publish: (() => {
        const publishedOnTime = filteredData.filter(
          (item) => item.status === "Completed"
        ).length;
        const publishedWithDelay = filteredData.filter(
          (item) => item.status === "In Progress"
        ).length;
        const failed = filteredData.filter(
          (item) => item.status === "Failed"
        ).length;
        const notPublished = filteredData.filter(
          (item) => item.status === "Not Published"
        ).length;
        return [
          { name: "Published On Time", value: publishedOnTime },
          { name: "Published With Delay", value: publishedWithDelay },
          { name: "Failed", value: failed },
          { name: "Not Published", value: notPublished },
        ];
      })(),
    }),
    [filteredData]
  );

  const minValue = useMemo(() => {
    const freshnessValues = chartData.freshness.flatMap((item) =>
      Object.values(item).filter((value) => typeof value === "number")
    );
    return Math.min(...freshnessValues) - 10;
  }, [chartData]);

  const maxValue = useMemo(() => {
    const freshnessValues = chartData.freshness.flatMap((item) =>
      Object.values(item).filter((value) => typeof value === "number")
    );
    return Math.max(...freshnessValues) + 10;
  }, [chartData]);

  if (!allData.length) {
    return <div className="p-4">No data available. Please check your data source.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <FilterSelect
          label="Project"
          value={filters.project}
          onChange={(value) => handleFilterChange("project", value)}
          options={["All", ...projects]}
        />
        <FilterSelect
          label="Pipeline"
          value={filters.pipeline}
          onChange={(value) => handleFilterChange("pipeline", value)}
          options={["All", ...pipelines]}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(value) => handleFilterChange("status", value)}
          options={["All", "In Progress", "Completed", "Failed", "Not Published"]}
        />
        <FilterSelect
          label="Duration"
          value={filters.duration}
          onChange={(value) => handleFilterChange("duration", value)}
          options={["All", "Today", "This Week", "This Month"]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartCard title="Latency Trend">
          <LineChart
            data={chartData.latency}
            margin={{ top: -5, left: -25, right: 5 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11 }}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip cursor={{ strokeWidth: 2 }} itemStyle={{ fontSize: 11 }} />
            {projects.map((proj, index) => (
              <Line
                key={`${proj}-${index}`}
                type="linear"
                dataKey={proj}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={(props) => {
                  const { key, ...rest } = props;
                  return <CustomizedDot {...rest} isShow={true} />;
                }}
              />
            ))}
            <Legend content={<CustomLegend />} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Cost Trend">
          <AreaChart
            data={chartData.cost}
            margin={{ top: -5, left: -25, right: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ strokeWidth: 2 }} itemStyle={{ fontSize: 11 }} />
            {projects.map((proj, index) => (
              <Area
                key={`${proj}-${index}`}
                type="linear"
                dataKey={proj}
                stackId="1"
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
            <Legend content={<CustomLegend />} />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Ingestion Status">
          <PieChart>
            <Pie
              data={chartData.ingestion}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {chartData.ingestion.map((_entry, index) => (
                <Cell
                  key={`${_entry}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip cursor={{ strokeWidth: 2 }} itemStyle={{ fontSize: 11 }} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ChartCard>

        <ChartCard title="Publish Status">
          <PieChart>
            <Pie
              data={chartData.publish}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {chartData.publish.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip cursor={{ strokeWidth: 2 }} itemStyle={{ fontSize: 11 }} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartCard title="Project Health Status">
          <BarChart
            data={chartData.health}
            layout="horizontal"
            margin={{ top: -5, left: -25, right: 5 }}
          >
            <XAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip cursor={{ strokeWidth: 2 }} itemStyle={{ fontSize: 11 }} />
            <Bar dataKey="success" stackId="a" fill="#82ca9d" />
            <Bar dataKey="failed" stackId="a" fill="#FF6B6B" />
            <Legend content={<CustomLegend />} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Project Quality Status">
          <BarChart
            layout="vertical"
            data={chartData.quality}
            margin={{ top: -5, left: -25, right: 5 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip cursor={{ strokeWidth: 2 }} itemStyle={{ fontSize: 11 }} />
            <Bar dataKey="success" stackId="a" fill="#82ca9d" />
            <Bar dataKey="failed" stackId="a" fill="#FF6B6B" />
            <Legend content={<CustomLegend />} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Incident Summary">
          <BarChart
            data={chartData.incident}
            margin={{ top: -5, left: -25, right: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ strokeWidth: 2 }} itemStyle={{ fontSize: 11 }} />
            <Bar dataKey="failed" stackId="a" fill="#FF6B6B" />
            <Bar dataKey="inProgress" stackId="a" fill="#ffc658" />
            <Bar dataKey="completed" stackId="a" fill="#82ca9d" />
            <Legend content={<CustomLegend />} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Freshness">
          <LineChart
            data={chartData.freshness}
            margin={{ top: -5, left: -25, right: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[minValue, maxValue]}
            />
            <Tooltip cursor={{ strokeWidth: 2 }} itemStyle={{ fontSize: 11 }} />
            {projects.map((proj, index) => (
              <Line
                key={`${proj}-${index}`}
                type="monotone"
                dataKey={proj}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={(props) => {
                  const { key, ...rest } = props;
                  return <CustomizedDot {...rest} isShow={false} />;
                }}
              />
            ))}
            <Legend content={<CustomLegend />} />
          </LineChart>
        </ChartCard>
      </div>
    </div>
  );
}
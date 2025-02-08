import type React from "react"
import { ChartCard } from "./chart-components"

import { LineChart, BarChart, AreaChart, PieChart } from "@/components/bh-charts"
export const LatencyTrendChart: React.FC<{ data: any[] }> = ({ data }) => (
    <ChartCard title="Latency Trend">
        <LineChart data={data} xAxisDataKey="name" lines={Object.keys(data[0] || {}).filter((key) => key !== "name")} />
    </ChartCard>
)

export const CostTrendChart: React.FC<{ data: any[] }> = ({ data }) => (
    <ChartCard title="Cost Trend">
        <AreaChart data={data} xAxisDataKey="name" areas={Object.keys(data[0] || {}).filter((key) => key !== "name")} />
    </ChartCard>
)

export const StatusDonutChart: React.FC<{ title: string; data: any[] }> = ({ title, data }) => (
    <ChartCard title={title}>
        <PieChart data={data} dataKey="value" nameKey="name" />
    </ChartCard>
)

export const ProjectHealthChart: React.FC<{ data: any[] }> = ({ data }) => (
    <ChartCard title="Project Health Status">
        <BarChart data={data} xAxisDataKey="name" bars={["success", "failed"]} />
    </ChartCard>
)

export const ProjectQualityChart: React.FC<{ data: any[] }> = ({ data }) => (
    <ChartCard title="Project Quality Status">
        <BarChart data={data} xAxisDataKey="name" bars={["success", "failed"]} />
    </ChartCard>
)

export const IncidentSummaryChart: React.FC<{ data: any[] }> = ({ data }) => (
    <ChartCard title="Incident Summary">
        <BarChart data={data} xAxisDataKey="name" bars={["failed", "inProgress", "completed"]} />
    </ChartCard>
)

export const FreshnessChart: React.FC<{ data: any[] }> = ({ data }) => (
    <ChartCard title="Freshness">
        <LineChart data={data} xAxisDataKey="name" lines={Object.keys(data[0] || {}).filter((key) => key !== "name")} />
    </ChartCard>
)
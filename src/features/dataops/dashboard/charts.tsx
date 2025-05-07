import type React from "react"
import { SortableChartCard } from "./SortableChartCard"
import { LineChart, BarChart, AreaChart, DonutChart } from "@/components/bh-charts"

// First, define base colors
const CHART_COLORS = {
  chart1: "var(--chart-1-color)", 
  chart2: "var(--chart-2-color)", 
  chart3: "var(--chart-3-color)", 
  chart4: "var(--chart-4-color)",
  chart5: "var(--chart-5-color)"
}

// Color palettes for different chart types
const palettes = {
  status: [CHART_COLORS.chart1, CHART_COLORS.chart2, CHART_COLORS.chart3, CHART_COLORS.chart4],
  trend: [CHART_COLORS.chart1, CHART_COLORS.chart2, CHART_COLORS.chart3, CHART_COLORS.chart4, CHART_COLORS.chart5],
  comparison: [CHART_COLORS.chart1, CHART_COLORS.chart3, CHART_COLORS.chart5]
}

// Update chartDefaults to include colors in each config
const chartDefaults = {
  lineConfig: {
    colors: palettes.trend,
    stroke: CHART_COLORS.chart1,
    strokeWidth: 2,
    activeDot: { r: 6, strokeWidth: 1, stroke: "#fff" },
    dot: { r: 3, strokeWidth: 1, stroke: "#fff" },
    animationDuration: 800,
    showGrid: true,
    connectNulls: true,
    showLegend: true,
    legendPosition: "top",
    margin: { top: 10, right: 30, left: 0, bottom: 5 }
  },
  areaConfig: {
    colors: palettes.trend,
    stroke: CHART_COLORS.chart1,
    strokeWidth: 2,
    fill: CHART_COLORS.chart1,
    fillOpacity: 0.2,
    activeDot: { r: 6, strokeWidth: 1, stroke: "#fff" },
    dot: { r: 0 },
    animationDuration: 800,
    showGrid: true,
    connectNulls: true,
    showLegend: true,
    legendPosition: "top",
    margin: { top: 10, right: 30, left: 0, bottom: 5 }
  },
  barConfig: {
    colors: palettes.status,
    barSize: 20,
    animationDuration: 800,
    showGrid: true,
    radius: [4, 4, 0, 0],
    showLegend: true,
    legendPosition: "top",
    margin: { top: 10, right: 30, left: 0, bottom: 5 }
  },
  donutConfig: {
    showLabels: true,
    labelType: "percent"
  }
}

// Helper function to prepare data with explicit colors for DonutChart
const prepareDonutData = (data: any[], colors: string[]) => {
  return data.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));
};

// Chart components with direct color prop
export const LatencyTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  const lines = Object.keys(data[0] || {}).filter((key) => key !== "name");
  
  return (
    <SortableChartCard id="latency" title="Latency" className="bg-gradient-to-br from-card to-card/95 overflow-hidden">
      <LineChart 
        data={data} 
        xAxisDataKey="name" 
        lines={lines}
        colors={palettes.trend}
        config={{
          ...chartDefaults.lineConfig,
          yAxisLabel: "ms"
        }}
      />
    </SortableChartCard>
  )
}

export const CostTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  const areas = Object.keys(data[0] || {}).filter((key) => key !== "name");
  
  return (
    <SortableChartCard id="cost" title="Cost" className="bg-gradient-to-br from-card to-card/95 overflow-hidden">
      <AreaChart 
        data={data} 
        xAxisDataKey="name" 
        areas={areas}
        colors={palettes.trend}
        config={{
          ...chartDefaults.areaConfig,
          yAxisLabel: "$",
          stacked: true
        }}
      />
    </SortableChartCard>
  )
}

export const StatusDonutChart: React.FC<{ title: string; data: any[] }> = ({ title, data }) => (
  <SortableChartCard id="ingestion" title={title} className="bg-gradient-to-br from-card to-card/95 overflow-hidden">
    <DonutChart 
      data={prepareDonutData(data, palettes.status)}
      dataKey="value" 
      nameKey="name"
      colors={palettes.status}
      config={{
        ...chartDefaults.donutConfig,
        showLabels: true,
        labelType: "percent"
      }}
    />
  </SortableChartCard>
)

export const ProjectHealthChart: React.FC<{ data: any[] }> = ({ data }) => (
  <SortableChartCard id="health" title="Health Status" className="bg-gradient-to-br from-card to-card/95 overflow-hidden">
    <BarChart 
      data={data} 
      xAxisDataKey="name" 
      bars={["success", "failed"]}
      colors={[CHART_COLORS.chart1, CHART_COLORS.chart4]}
      config={{
        ...chartDefaults.barConfig,
        barGap: 2
      }}
    />
  </SortableChartCard>
)
export const MockDataChart: React.FC<{ data: any[] }> = ({ data }) => (
  <SortableChartCard id="health" title="Latency Chart" className="bg-gradient-to-br from-card to-card/95 overflow-hidden">
    <BarChart 
      data={data} 
      xAxisDataKey="name" 
      bars={["success"]}
      colors={[CHART_COLORS.chart1, CHART_COLORS.chart4]}
      yAxisLabel="minutes"
      config={{
        ...chartDefaults.barConfig,
        yAxisLabel: 'm sec',
        barGap: 4
      }}
    />
  </SortableChartCard>
)

export const ProjectQualityChart: React.FC<{ data: any[] }> = ({ data }) => (
  <SortableChartCard id="quality" title="Quality" className="bg-gradient-to-br from-card to-card/95 overflow-hidden">
    <BarChart 
      data={data} 
      xAxisDataKey="name" 
      bars={["success", "failed"]}
      colors={[CHART_COLORS.chart1, CHART_COLORS.chart4]}
      config={{
        ...chartDefaults.barConfig,
        barGap: 3,
        yAxisLabel: "%"
      }}
    />
  </SortableChartCard>
)

export const IncidentSummaryChart: React.FC<{ data: any[] }> = ({ data }) => (
  <SortableChartCard id="incident" title="Incidents" className="bg-gradient-to-br from-card to-card/95 overflow-hidden">
    <BarChart 
      data={data} 
      xAxisDataKey="name" 
      bars={["failed", "inProgress", "completed"]}
      colors={[CHART_COLORS.chart4, CHART_COLORS.chart3, CHART_COLORS.chart1]}
      config={{
        ...chartDefaults.barConfig,
        barGap: 3
      }}
    />
  </SortableChartCard>
)
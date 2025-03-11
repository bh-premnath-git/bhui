import { useMemo, useState } from "react";
import { QueryResult } from "@/types/data-catalog/xplore/type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  AreaChart,
  BubbleChart,
  HistogramChart,
  GaugeChart,
  DonutChart,
  RadarChart,
  TreemapChart,
} from "@/components/bh-charts";
import { DataActionMenu } from "./data-action-menu";
import ChartContainer from './chart-container';
import { PanelLayout } from "@/components/shared/SharedPanel";
import { motion } from "framer-motion";
import { BarChart3, LayoutList } from "lucide-react";

interface DataViewProps {
  result: QueryResult;
  isEmbedded?: boolean;
}

interface ChartDataItem {
  [key: string]: string | number;
}

interface GaugeDataItem {
  name: string;
  value: number;
}

export function DataView({ result, isEmbedded = false }: DataViewProps) {
  const [currentResult, setCurrentResult] = useState<QueryResult>(result);

  // Handle chart changes from the toolbar
  const handleChartChange = (updatedResult: QueryResult) => {
    setCurrentResult(updatedResult);
  };

  if (currentResult.type === 'table' && currentResult.data) {
    const tableData = Array.isArray(currentResult.data) ? currentResult.data : [];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-full max-w-full"
      >
        <div className={isEmbedded ? "" : "bg-card/50 border border-border/80 shadow-sm rounded-lg overflow-hidden"}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center">
                <LayoutList className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">
                {currentResult.title || "Table Results"}
                {tableData.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {tableData.length} {tableData.length === 1 ? 'row' : 'rows'}
                  </span>
                )}
              </h3>
            </div>
            <DataActionMenu result={currentResult} />
          </div>
          <div className="rounded-md border bg-card/70 overflow-hidden horizontal-scrollbar">
            <div className="max-w-full overflow-x-auto horizontal-scrollbar">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    {currentResult.columns?.map((column) => (
                      <TableHead key={column} className="text-xs font-medium py-2">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, i) => (
                    <TableRow key={i} className={i % 2 === 0 ? "bg-background/40" : ""}>
                      {currentResult.columns?.map((column) => (
                        <TableCell key={column} className="text-sm py-1.5 break-words max-w-xs">
                          {row[column] !== null && row[column] !== undefined
                            ? String(row[column])
                            : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  else if (currentResult.type === 'chart' && currentResult.data) {
    // Default chart config
    const chartConfig = {
      showGrid: true,
      showLabels: true,
      showLegend: true,
      valueFormatter: (value: number) => {
        if (currentResult.format === 'currency') {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        }
        if (currentResult.format === 'percent') {
          return `${value}%`;
        }
        return value.toLocaleString();
      },
      ...currentResult.config
    };

    // Special handling for gauge chart
    if (currentResult.chartType === 'gauge') {
      let gaugeData: GaugeDataItem;

      if (Array.isArray(currentResult.data)) {
        const firstItem = currentResult.data[0] || {};
        gaugeData = {
          name: String(firstItem[currentResult.xAxis || 'name'] || ''),
          value: Number(firstItem[currentResult.yAxis || 'value'] || 0)
        };
      } else {
        const data = currentResult.data as Record<string, any>;
        gaugeData = {
          name: String(data.name || ''),
          value: Number(data.value || 0)
        };
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className={isEmbedded ? "" : "bg-card/50 border border-border/80 shadow-sm rounded-lg overflow-hidden"}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">{currentResult.title || "Gauge Chart"}</h3>
              </div>
              <DataActionMenu result={currentResult} />
            </div>
            <div className="h-[400px] w-full bg-card/70 rounded-md p-4 max-w-full overflow-hidden">
              <ChartContainer result={currentResult} onChartChange={handleChartChange}>
                <GaugeChart
                  value={gaugeData.value}
                  min={currentResult.min || 0}
                  max={currentResult.max || 100}
                  label={gaugeData.name}
                  config={chartConfig}
                />
              </ChartContainer>
            </div>
          </div>
        </motion.div>
      );
    }

    // Special handling for histogram
    if (currentResult.chartType === 'histogram') {
      const histogramData = Array.isArray(currentResult.data)
        ? currentResult.data.map((d: ChartDataItem) => Number(d[currentResult.yAxis || 'value']))
        : [];
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className={isEmbedded ? "" : "bg-card/50 border border-border/80 shadow-sm rounded-lg overflow-hidden"}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">{currentResult.title || "Histogram"}</h3>
              </div>
              <DataActionMenu result={currentResult} />
            </div>
            <div className="h-[400px] w-full bg-card/70 rounded-md p-4 max-w-full overflow-hidden">
              <ChartContainer result={currentResult} onChartChange={handleChartChange}>
                <HistogramChart
                  data={histogramData}
                  config={chartConfig}
                />
              </ChartContainer>
            </div>
          </div>
        </motion.div>
      );
    }

    // Process standardized data
    const standardData = useMemo(() => {
      if (currentResult.isMultiSeries && !Array.isArray(currentResult.data)) {
        return Object.entries(currentResult.data as Record<string, any[]>).map(([key, items]) =>
          items.map(item => ({
            ...item,
            series: key
          }))
        ).flat();
      }
      return Array.isArray(currentResult.data) ? currentResult.data : [];
    }, [currentResult.data, currentResult.isMultiSeries]);

    // Render the appropriate chart based on chartType
    const renderChart = () => {
      const yAxis = currentResult.yAxis || 'value';
      const chartConfig = currentResult.config || {};

      switch (currentResult.chartType) {
        case 'bar':
          return (
            <BarChart
              data={standardData}
              xAxisDataKey={currentResult.xAxis || 'name'}
              bars={currentResult.isMultiSeries ? ['series'] : [yAxis]}
              colors={['var(--chart-1-color)', 'var(--chart-2-color)']}
              config={chartConfig}
              isMultiSeries={currentResult.isMultiSeries}
              xAxisLabel={currentResult.xAxisLabel}
              yAxisLabel={currentResult.yAxisLabel}
            />
          );

        case 'line':
          return (
            <LineChart
              data={standardData}
              xAxisDataKey={currentResult.xAxis || 'name'}
              lines={currentResult.isMultiSeries ? ['series'] : [yAxis]}
              colors={['var(--chart-1-color)', 'var(--chart-2-color)']}
              config={{
                ...chartConfig,
                // Force stroke width to be visible
                strokeWidth: 3,
                // Add dot radius to make points more visible
                dotRadius: 5,
                // Enable animation
                isAnimationActive: true,
                // Set true to make it more visible with color fill
                showArea: true
              }}
              isMultiSeries={currentResult.isMultiSeries}
            />
          );

        case 'area':
          return (
            <AreaChart
              data={standardData}
              xAxisDataKey={currentResult.xAxis || 'name'}
              areas={currentResult.isMultiSeries ? ['series'] : [yAxis]}
              colors={['var(--chart-1-color)', 'var(--chart-2-color)']}
              stacked={currentResult.config?.stacked}
              config={chartConfig}
            />
          );

        case 'pie':
          return (
            <PieChart
              data={standardData}
              dataKey={yAxis}
              nameKey={currentResult.xAxis || 'name'}
              colors={['var(--chart-1-color)', 'var(--chart-2-color)']}
              config={chartConfig}
            />
          );

        case 'donut':
          return (
            <DonutChart
              data={standardData.map(item => ({
                name: String(item[currentResult.xAxis || 'name']),
                value: Number(item[yAxis] || 0)
              }))}
              config={chartConfig}
            />
          );

        case 'scatter':
          return (
            <ScatterChart
              data={standardData}
              xKey={currentResult.xAxis || 'name'}
              yKey={yAxis}
              name={currentResult.title || "Scatter Plot"}
              config={chartConfig}
            />
          );

        case 'bubble':
          return (
            <BubbleChart
              data={standardData}
              xAxisDataKey={currentResult.xAxis || 'name'}
              yAxisDataKey={yAxis}
              sizeKey={currentResult.sizeKey || 'size'}
              groups={currentResult.isMultiSeries ? ['series'] : []}
              colors={['var(--chart-1-color)', 'var(--chart-2-color)']}
              isMultiSeries={currentResult.isMultiSeries}
              config={chartConfig}
            />
          );

        case 'radar':
          return (
            <RadarChart
              data={standardData}
              variables={Array.from(new Set(standardData.map(item => String(item[currentResult.xAxis || 'name']))))}
              groups={currentResult.isMultiSeries ? ['series'] : [yAxis]}
              colors={['var(--chart-1-color)', 'var(--chart-2-color)']}
              config={chartConfig}
            />
          );

        case 'treemap':
          return (
            <TreemapChart
              data={standardData}
              dataKey={yAxis}
              nameKey={currentResult.xAxis || 'name'}
              isMultiSeries={currentResult.isMultiSeries}
              colors={['var(--chart-1-color)', 'var(--chart-2-color)']}
              config={chartConfig}
            />
          );

        default:
          return (
            <BarChart
              data={standardData}
              xAxisDataKey={currentResult.xAxis || 'name'}
              bars={currentResult.isMultiSeries ? ['series'] : [yAxis]}
              colors={['var(--chart-1-color)', 'var(--chart-2-color)']}
              config={chartConfig}
            />
          );
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={isEmbedded ? "" : "bg-card/50 border border-border/80 shadow-sm rounded-lg overflow-hidden"}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">{currentResult.title || "Chart"}</h3>
            </div>
            <DataActionMenu result={currentResult} />
          </div>
          <div className="h-[400px] w-full bg-card/70 rounded-md p-4 max-w-full overflow-hidden">
            <ChartContainer result={currentResult} onChartChange={handleChartChange}>
              {renderChart()}
            </ChartContainer>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
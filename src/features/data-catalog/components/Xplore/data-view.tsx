import { useEffect, useMemo, useState } from "react";
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
import { motion } from "framer-motion";
import { BarChart3, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Define types for data detection
interface DataTypeInfo {
  type: 'numeric' | 'date' | 'category';
  confidence: number;
  format?: string;
  sample?: any[];
}

interface DetectedProperties {
  numericKeys: Array<{ key: string; info: DataTypeInfo }>;
  dateKeys: Array<{ key: string; info: DataTypeInfo }>;
  categoryKeys: Array<{ key: string; info: DataTypeInfo }>;
}

const detectDataProperties = (data: any[], sampleSize = 10): DetectedProperties => {
  if (!data.length) {
    return { numericKeys: [], dateKeys: [], categoryKeys: [] };
  }

  // Get a representative sample of the data
  const sampleData = data.length > sampleSize 
    ? [...Array(sampleSize)].map(() => data[Math.floor(Math.random() * data.length)])
    : data;

  const keys = Object.keys(sampleData[0]);
  const analysis: Record<string, { counts: Record<string, number>, samples: any[] }> = {};

  // Initialize analysis structure
  keys.forEach(key => {
    analysis[key] = {
      counts: { numeric: 0, date: 0, category: 0 },
      samples: []
    };
  });

  // Analyze each sample
  sampleData.forEach(item => {
    keys.forEach(key => {
      const value = item[key];
      analysis[key].samples.push(value);

      if (value === null || value === undefined) return;

      // Try to detect numeric values
      if (typeof value === 'number' || (!isNaN(Number(value)) && value !== '')) {
        analysis[key].counts.numeric++;
        return;
      }

      // Try to detect dates
      const dateValue = new Date(value);
      if (
        value instanceof Date || 
        (!isNaN(dateValue.getTime()) && 
         typeof value === 'string' && 
         /^\d{4}[-/]?\d{1,2}[-/]?\d{1,2}|^\d{1,2}[-/]?\d{1,2}[-/]?\d{4}/.test(value)
        )
      ) {
        analysis[key].counts.date++;
        return;
      }

      // Default to category
      analysis[key].counts.category++;
    });
  });

  // Determine types based on analysis
  const result: DetectedProperties = {
    numericKeys: [],
    dateKeys: [],
    categoryKeys: []
  };

  keys.forEach(key => {
    const { counts, samples } = analysis[key];
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    // Calculate confidence levels
    const numericConfidence = counts.numeric / total;
    const dateConfidence = counts.date / total;
    const categoryConfidence = counts.category / total;

    // Detect format patterns
    const detectFormat = (samples: any[]): string | undefined => {
      const sample = samples.find(s => s !== null && s !== undefined);
      if (!sample) return undefined;

      if (typeof sample === 'string') {
        if (/^\$/.test(sample)) return 'currency';
        if (/%$/.test(sample)) return 'percent';
        if (/^\d{4}-\d{2}$/.test(sample)) {
          return 'YYYY-MM';
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(sample)) return 'YYYY-MM-DD';
      }
      return undefined;
    };

    const info: DataTypeInfo = {
      type: 'category',
      confidence: 0,
      format: detectFormat(samples),
      sample: samples.slice(0, 3)
    };

    // Classify based on highest confidence
    if (numericConfidence > 0.7) {
      info.type = 'numeric';
      info.confidence = numericConfidence;
      result.numericKeys.push({ key, info });
    } else if (dateConfidence > 0.7) {
      info.type = 'date';
      info.confidence = dateConfidence;
      result.dateKeys.push({ key, info });
    } else {
      info.type = 'category';
      info.confidence = categoryConfidence;
      result.categoryKeys.push({ key, info });
    }
  });

  return result;
};

const createChartConfig = (
  chartType: string,
  data: any[],
  currentConfig: Record<string, any> = {},
  format?: string
) => {
  // Detect data properties with improved detection
  const detected = detectDataProperties(data);
  

  // Get best candidates for different axis types
  const getBestKey = (type: 'numeric' | 'date' | 'category'): string | undefined => {
    let candidates;
    switch (type) {
      case 'numeric':
        candidates = detected.numericKeys;
        break;
      case 'date':
        candidates = detected.dateKeys;
        break;
      case 'category':
        candidates = detected.categoryKeys;
        break;
    }
    return candidates.sort((a, b) => b.info.confidence - a.info.confidence)[0]?.key;
  };

  // Base config with smart defaults
  const baseConfig = {
    showGrid: true,
    showLabels: true,
    showLegend: true,
    isAnimationActive: true,
    valueFormatter: (value: number) => {
      const numericKey = detected.numericKeys.find(k => k.info.format);
      const detectedFormat = numericKey?.info.format;

      if (format || detectedFormat) {
        if (format === 'currency' || detectedFormat === 'currency') {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        }
        if (format === 'percent' || detectedFormat === 'percent') {
          return `${value}%`;
        }
      }
      if (Number.isInteger(value)) {
        return value.toString();
      }
      return value.toLocaleString();
    }
  };

  // Chart-specific default configurations
  const chartSpecificConfig = {
    line: {
      strokeWidth: 3,
      dotRadius: 5,
      showArea: false,
      xAxisKey: getBestKey('date') || getBestKey('category') || getBestKey('numeric'),
      yAxisKey: getBestKey('numeric'),
      connectNulls: true
    },
    bar: {
      barSize: 32,
      xAxisKey: getBestKey('category') || getBestKey('date') || getBestKey('numeric'),
      yAxisKey: getBestKey('numeric'),
      stackOffset: 'none'
    },
    area: {
      strokeWidth: 2,
      fillOpacity: 0.3,
      xAxisKey: getBestKey('date') || getBestKey('category'),
      yAxisKey: getBestKey('numeric'),
      stackOffset: 'none'
    },
    pie: {
      innerRadius: 0,
      nameKey: getBestKey('category'),
      valueKey: getBestKey('numeric'),
      labelType: 'percent'
    },
    donut: {
      innerRadius: '60%',
      nameKey: getBestKey('category'),
      valueKey: getBestKey('numeric'),
      labelType: 'percent'
    },
    scatter: {
      xAxisKey: getBestKey('numeric'),
      yAxisKey: getBestKey('numeric'),
      dotSize: 6
    },
    bubble: {
      xAxisKey: getBestKey('numeric'),
      yAxisKey: getBestKey('numeric'),
      sizeKey: getBestKey('numeric'),
      minBubbleSize: 5,
      maxBubbleSize: 30
    },
    radar: {
      variables: Array.from(new Set(data.map(item => String(item[getBestKey('category') || 'name'])))),
      fillOpacity: 0.3,
      strokeWidth: 2
    },
    gauge: {
      min: 0,
      max: 100,
      arcWidth: 0.2,
      cornerRadius: 2,
      animationDuration: 1000
    },
    treemap: {
      nameKey: getBestKey('category'),
      valueKey: getBestKey('numeric'),
      aspectRatio: 1,
      colorScale: 'sequential'
    },
    histogram: {
      bins: 10,
      valueKey: getBestKey('numeric'),
      normalized: false
    }
  };

  // Merge configurations with priority: currentConfig > chartSpecific > baseConfig
  return {
    ...baseConfig,
    ...(chartSpecificConfig[chartType] || {}),
    ...currentConfig
  };
};

export function DataView({ result, isEmbedded = false }: DataViewProps) {
  const [currentResult, setCurrentResult] = useState<QueryResult>(result);

  // Add a useEffect to log config changes for debugging
  useEffect(() => {
    console.log('Current chart config:', currentResult.config);
  }, [currentResult.config]);

  // Handle chart changes from the toolbar
  const handleChartChange = (updatedResult: QueryResult) => {
    console.log('Chart change:', updatedResult);
    setCurrentResult(updatedResult);
  };

  // IMPORTANT: Move chart rendering logic into functions but don't return from them
  // This ensures hooks are always called in the same order
  const renderTableContent = () => {
    if (!(currentResult.type === 'table' && currentResult.data)) {
      return null;
    }
    
    const tableData = Array.isArray(currentResult.data) ? currentResult.data : [];

    useEffect(() => {
      console.log('Current chart config:', currentResult);
    }, [currentResult]);

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
  };

  const renderChartContent = () => {
    if (!(currentResult.type === 'chart' && currentResult.data)) {
      return null;
    }
    
    // Check if we have the new format with x_axis and y_axis properties
    const isNewFormat = Array.isArray(currentResult.data) && 
      currentResult.data.length > 0 &&
      'x_axis' in currentResult.data[0] && 
      'y_axis' in currentResult.data[0];

    // Transform the new format to be compatible with our chart components
    const processedData = isNewFormat 
      ? (currentResult.data as any[]).map((item: any) => ({
          name: item.x_axis,
          value: item.y_axis
        }))
      : currentResult.data;
    
    const workingResult = {
      ...currentResult,
      data: processedData
    };
    
    if (isNewFormat) {
      workingResult.xAxis = 'name';
      workingResult.yAxis = 'value';
    }
    
    // Create dynamic chart configuration
    const chartConfig = createChartConfig(
      workingResult.chartType,
      Array.isArray(workingResult.data) ? workingResult.data : [],
      workingResult.config,
      workingResult.format
    );
    
    // Process standardized data
    const standardData = useMemo(() => {
      if (workingResult.isMultiSeries && !Array.isArray(workingResult.data)) {
        const processedData = Object.entries(workingResult.data as Record<string, any[]>).map(([key, items]) =>
          items.map(item => ({
            ...item,
            series: key
          }))
        ).flat();
        return processedData;
      }
      return Array.isArray(workingResult.data) ? workingResult.data : [];
    }, [workingResult.data, workingResult.isMultiSeries]);

    // Render the appropriate chart based on chartType
    const renderChart = () => {
      const yAxis = workingResult.yAxis || 'value';
      const xAxis = workingResult.xAxis || 'name';

      // For gauge chart
      if (workingResult.chartType === 'gauge') {
        let gaugeData: GaugeDataItem = { name: '', value: 0 };

        if (Array.isArray(workingResult.data)) {
          const firstItem = workingResult.data[0] || {};
          gaugeData = {
            name: String(firstItem[workingResult.xAxis || 'name'] || ''),
            value: Number(firstItem[workingResult.yAxis || 'value'] || 0)
          };
        } else {
          const data = workingResult.data as Record<string, any>;
          gaugeData = {
            name: String(data.name || ''),
            value: Number(data.value || 0)
          };
        }

        return (
          <GaugeChart
            value={gaugeData.value}
            min={workingResult.min || 0}
            max={workingResult.max || 100}
            label={gaugeData.name}
            config={chartConfig}
          />
        );
      }

      // For histogram
      if (workingResult.chartType === 'histogram') {
        const histogramData = Array.isArray(workingResult.data)
          ? workingResult.data.map((d: ChartDataItem) => Number(d[workingResult.yAxis || 'value']))
          : [];
        
        return (
          <HistogramChart
            data={histogramData}
            config={chartConfig}
          />
        );
      }

      // For all other chart types
      switch (workingResult.chartType) {
        case 'bar':
          return (
            <BarChart
              data={standardData}
              xAxisDataKey={xAxis}
              bars={workingResult.isMultiSeries ? ['series'] : [yAxis]}
              config={chartConfig}
              isMultiSeries={workingResult.isMultiSeries}
              xAxisLabel={workingResult.xAxisLabel}
              yAxisLabel={workingResult.yAxisLabel}
            />
          );

        case 'line':
          return (
            <LineChart
              data={standardData}
              xAxisDataKey={xAxis}
              lines={[yAxis]}
              config={chartConfig}
              isMultiSeries={workingResult.isMultiSeries}
            />
          );

        case 'area':
          return (
            <AreaChart
              data={standardData}
              xAxisDataKey={xAxis}
              areas={workingResult.isMultiSeries ? ['series'] : [yAxis]}
              stacked={workingResult.config?.stacked}
              config={chartConfig}
            />
          );

        case 'pie':
          return (
            <PieChart
              data={standardData}
              dataKey={yAxis}
              nameKey={xAxis}
              config={chartConfig}
            />
          );

        case 'donut':
          return (
            <DonutChart
              data={standardData.map(item => ({
                name: String(item[xAxis]),
                value: Number(item[yAxis] || 0)
              }))}
              config={chartConfig}
            />
          );

        case 'scatter':
          return (
            <ScatterChart
              data={standardData}
              xKey={xAxis}
              yKey={yAxis}
              name={workingResult.title || "Scatter Plot"}
              config={chartConfig}
            />
          );

        case 'bubble':
          return (
            <BubbleChart
              data={standardData}
              xAxisDataKey={xAxis}
              yAxisDataKey={yAxis}
              sizeKey={workingResult.sizeKey || 'size'}
              groups={workingResult.isMultiSeries ? ['series'] : []}
              isMultiSeries={workingResult.isMultiSeries}
              config={chartConfig}
            />
          );

        case 'radar':
          return (
            <RadarChart
              data={standardData}
              variables={Array.from(new Set(standardData.map(item => String(item[xAxis]))))}
              groups={workingResult.isMultiSeries ? ['series'] : [yAxis]}
              config={chartConfig}
            />
          );

        case 'treemap':
          return (
            <TreemapChart
              data={standardData}
              dataKey={yAxis}
              nameKey={xAxis}
              isMultiSeries={workingResult.isMultiSeries}
              config={chartConfig}
            />
          );

        default:
          return (
            <BarChart
              data={standardData}
              xAxisDataKey={xAxis}
              bars={workingResult.isMultiSeries ? ['series'] : [yAxis]}
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
              <h3 className="text-sm font-medium">{workingResult.title || "Chart"}</h3>
            </div>
            <DataActionMenu result={workingResult} />
          </div>
          <div className={cn(
            "h-[400px] w-full bg-card/70 rounded-md p-4 max-w-full",
            workingResult.chartType === 'donut' ? "overflow-visible" : "overflow-hidden"
          )}>
            <ChartContainer result={workingResult} onChartChange={handleChartChange}>
              {renderChart()}
            </ChartContainer>
          </div>
        </div>
      </motion.div>
    );
  };

  // Now use the rendered content based on type, but without early returns that could skip hook calls
  const tableContent = renderTableContent();
  const chartContent = renderChartContent();

  // Single return point at the end of the component
  return tableContent || chartContent || null;
}
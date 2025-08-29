import { useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { ChartType, ColorScheme } from '@/store/slices/dataops/dashboardSlice';
import { getColorPalette } from '@/lib/colorSchemes';

interface ChartViewProps {
  data: any[] | null | undefined;
  layout?: any;
  widgetId: string;
  chartType: ChartType;
  color: { scheme: ColorScheme; customPalette?: string[] };
}

export const ChartView = ({ data, layout, widgetId, chartType, color }: ChartViewProps) => {
  const plotRef = useRef<any>(null);
  delete layout.title;
  // Handle null, undefined, or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">
          No chart data available
        </div>
      </div>
    );
  }

  // Check if data contains meaningful chart data
  const hasValidData = data.some((trace: any) => {
    if (!trace || typeof trace !== 'object') return false;
    
    // Check if trace has actual data points
    const hasXData = trace.x && Array.isArray(trace.x) && trace.x.length > 0;
    const hasYData = trace.y && Array.isArray(trace.y) && trace.y.length > 0;
    const hasValues = trace.values && Array.isArray(trace.values) && trace.values.length > 0; // for pie charts
    const hasLabels = trace.labels && Array.isArray(trace.labels) && trace.labels.length > 0; // for pie charts
    
    return hasXData || hasYData || hasValues || hasLabels;
  });

  // If no valid data, show empty state instead of empty chart
  if (!hasValidData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">
          No chart data available
        </div>
      </div>
    );
  }

  const palette = getColorPalette(color.scheme, color.customPalette);
  
  // Safely process data with error handling
  const processedData = data.map((trace: any, idx: number) => {
    // Handle invalid trace objects
    if (!trace || typeof trace !== 'object') {
      return {
        x: [],
        y: [],
        type: chartType,
        marker: { color: palette[idx % palette.length] }
      };
    }

    const traceColor = palette[idx % palette.length];
    const marker = { ...(trace.marker || {}) };

    if (chartType === 'pie') {
      marker.colors = palette;
    } else {
      marker.color = traceColor;
    }
    
    return {
      ...trace,
      type: chartType,
      marker,
    };
  });

  const defaultLayout = {
    margin: { t: 10, b: 30, l: 40, r: 15 },
    font: { family: 'Inter, sans-serif', size: 12 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    autosize: true,
    colorway: palette,
    ...layout
  };

  useEffect(() => {
    // Force resize when component mounts or updates
    const timer = setTimeout(() => {
      if (plotRef.current) {
        window.dispatchEvent(new Event('resize'));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [chartType, color.scheme]);

  return (
    <div className="w-full h-full" key={widgetId}>
      <Plot
        ref={plotRef}
        data={processedData}
        layout={defaultLayout}
        config={{
          displayModeBar: false,
          responsive: true
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        className="w-full h-full"
      />
    </div>
  );
};
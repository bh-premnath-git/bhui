import { useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { ChartType, ColorScheme } from '@/store/slices/dataops/dashboardStore';
import { getColorPalette } from '@/lib/colorSchemes';

interface ChartViewProps {
  data: any[];
  layout?: any;
  widgetId: string;
  chartType: ChartType;
  color: { scheme: ColorScheme; customPalette?: string[] };
}

export const ChartView = ({ data, layout, widgetId, chartType, color }: ChartViewProps) => {
  const plotRef = useRef<any>(null);
  const palette = getColorPalette(color.scheme, color.customPalette);
  const processedData = data.map((trace: any, idx: number) => {
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
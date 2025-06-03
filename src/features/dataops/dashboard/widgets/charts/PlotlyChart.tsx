import { useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { useResettableState } from '@/hooks/useResettableState';
import { Widget as WidgetType } from "@/types/dataops/dataops-dash";
import Plot from 'react-plotly.js';
import { LoadingState } from '@/components/shared/LoadingState';

interface PlotlyChartProps {
  widget: WidgetType;
  defaultFontSize?: number;
  height?: number;
  className?: string;
}

export const PlotlyChart = ({ widget, defaultFontSize = 12, height = 300, className = '' }: PlotlyChartProps) => {
  // Use resettable state to track container dimensions
  const [size, setSize] = useResettableState(
    () => null as { width: number; height: number } | null,
    [widget.chart_config] // Reset when chart config changes
  );

  // Refs for measurement and observation
  const measureDiv = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  
  // Initial measurement on mount
  useLayoutEffect(() => {
    if (!size && measureDiv.current) {
      const { width, height } = measureDiv.current.getBoundingClientRect();
      setSize({ width, height });
    }
  }, [measureDiv.current, size]);

  // Set up resize observer
  useEffect(() => {
    if (!container.current) return;

    const parent = container.current.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(
      debounce(() => {
        setSize(null); // Trigger remeasurement
      }, 500)
    );

    observer.observe(parent);
    return () => observer.disconnect();
  }, [container]);

  // Prepare chart data from widget
  const data = useMemo(() => {
    // Transform widget.executed_query into Plotly data format
    // This will depend on your data structure
    return widget.executed_query?.map(item => ({
      x: [item.month_label || item.date],
      y: [item[widget.chart_config.yAxis]],
      type: widget.chart_config.type === 'line_chart' ? 'scatter' : 'bar',
      mode: 'lines+markers',
      name: item.project_name,
    })) || [];
  }, [widget]);

  // Generate layout configuration based on container size
  const layout = useMemo(() => {
    // Default dimensions if container not yet measured
    const defaultWidth = 700;
    const defaultHeight = 450;
    
    // Use measured size or fall back to defaults
    const actualWidth = size?.width ?? defaultWidth;
    const actualHeight = size?.height ?? defaultHeight;
    
    // Calculate scale factors for responsive sizing
    const wScale = actualWidth / defaultWidth;
    const hScale = actualHeight / defaultHeight;
    
    // Scale font size based on container dimensions
    const fontScale = Math.min(wScale, hScale, 1);

    return {
      autosize: true,
      width: actualWidth,
      height: actualHeight,
      title: widget.name,
      font: {
        family: 'Inter, system-ui, sans-serif',
        size: defaultFontSize * fontScale,
        color: 'hsl(var(--foreground))'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: {
        l: 50 * wScale,
        r: 30 * wScale,
        t: 50 * hScale,
        b: 50 * hScale,
        pad: 5
      },
      xaxis: {
        title: widget.chart_config.xAxis,
        gridcolor: 'hsl(var(--border))',
        zerolinecolor: 'hsl(var(--border))'
      },
      yaxis: {
        title: widget.chart_config.yAxis,
        gridcolor: 'hsl(var(--border))',
        zerolinecolor: 'hsl(var(--border))'
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1.1,
        orientation: 'h',
        itemsizing: 'constant',
        traceorder: 'normal'
      }
    };
  }, [size, widget.chart_config, widget.name, defaultFontSize]);

  // Configuration for Plotly
  const config = useMemo(
    () => ({
      displaylogo: false,
      displayModeBar: false,
      responsive: true,
    }),
    []
  );

  const plotlyData = useMemo(() => {
    if (!widget.intermediate_executed_query_json) {
      return null;
    }

    try {
      // If it's already parsed, use it directly
      if (typeof widget.intermediate_executed_query_json === 'object') {
        return widget.intermediate_executed_query_json;
      }
      
      // Otherwise parse it from string
      return JSON.parse(widget.intermediate_executed_query_json);
    } catch (error) {
      console.error('Failed to parse Plotly data:', error);
      return null;
    }
  }, [widget.intermediate_executed_query_json]);

  if (!plotlyData) {
    return <LoadingState fullScreen={false} />;
  }

  const { data: plotlyDataData, layout: plotlyDataLayout } = plotlyData;

  // Apply square markers to the data from widget.executed_query
  const enhancedData = useMemo(() => {
    return data.map(trace => {
      const baseProps = {
        ...trace,
        marker: {
          symbol: 'square',
        },
        showlegend: true,
        legendgroup: trace.name || '',
      };
      
      // Only add line property for scatter type charts
      if (trace.type === 'scatter') {
        return {
          ...baseProps,
          line: {
            showlegend: false
          }
        };
      }
      
      return baseProps;
    });
  }, [data]);

  // Apply square markers to the data from intermediate_executed_query_json
  const enhancedPlotlyData = plotlyDataData.map(trace => {
    const baseProps = {
      ...trace,
      marker: {
        ...(trace.marker || {}),
        symbol: 'square',
      },
      mode: trace.type === 'scatter' ? 'lines+markers' : trace.mode,
      showlegend: true,
      legendgroup: trace.name || '',
    };
    
    // Only add line property for scatter type charts
    if (trace.type === 'scatter') {
      return {
        ...baseProps,
        line: {
          ...(trace.line || {}),
          showlegend: false
        }
      };
    }
    
    return baseProps;
  });

  // Merge the provided layout with responsive settings
  const finalLayout = {
    ...plotlyDataLayout,
    autosize: true,
    height: height,
    margin: { l: 40, r: 20, t: 30, b: 60, ...plotlyDataLayout?.margin },
    font: { family: 'Inter, sans-serif', size: 10, ...plotlyDataLayout?.font },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: true,
    legend: {
      orientation: 'h',
      xanchor: 'center',
      yanchor: 'top',
      y: -0.2,
      x: 0.5,
      itemsizing: 'constant',
      traceorder: 'normal',
      ...plotlyDataLayout?.legend,
    }
  };

  return (
    <div ref={container} className={`w-full h-full ${className}`}>
      <div ref={measureDiv} className="absolute inset-0">
        {size && (
          <Plot
            data={enhancedData}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '100%' }}
          />
        )}
        <Plot
          data={enhancedPlotlyData}
          layout={finalLayout}
          config={{ 
            responsive: true,
            displayModeBar: false,
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

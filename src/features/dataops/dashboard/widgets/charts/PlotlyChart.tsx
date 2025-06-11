import { useMemo } from 'react';
import { Widget as WidgetType } from "@/types/dataops/dataops-dash";
import Plot from 'react-plotly.js';
import { LoadingState } from '@/components/shared/LoadingState';
import { Layout as PlotlyLayout } from 'plotly.js';

interface PlotlyChartProps {
  widget: WidgetType;
  defaultFontSize?: number;
  height?: number;
  className?: string;
}

export const PlotlyChart = ({ widget, defaultFontSize = 12, height = 200, className = '' }: PlotlyChartProps) => {
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

  // Apply square markers to the data from intermediate_executed_query_json
  const enhancedData = plotlyDataData.map((trace: any) => {
    // Use any for intermediate data since it's already untyped
    const result: any = { ...trace };
    
    let newMode = result.mode;
    // If it's a line-like trace, ensure 'markers' is in the mode for legend display
    if (typeof result.mode === 'string' && result.mode.includes('lines') && !result.mode.includes('markers')) {
      newMode = result.mode + '+markers';
    } else if (!result.mode && (result.type === 'scatter' || result.type === 'line')) {
      // Default to lines+markers if mode is missing for scatter/line
      newMode = 'lines+markers';
    }

    result.mode = newMode;
    result.showlegend = result.showlegend === undefined ? true : result.showlegend;
    result.legendgroup = result.legendgroup || result.name || `trace-${Math.random().toString(36).substr(2, 9)}`;
    
    // Apply properties based on trace type
    if (result.type !== 'pie' && result.type !== 'violin') {
      result.marker = {
        symbol: 'square',
        size: 8,
        line: {
          width: 1,
          color: '#fff',
          ...(trace.marker?.line || {}),
        },
        ...(trace.marker || {}), // Preserve other marker settings
      };
    }
    
    return result;
  });

  // Merge the provided layout with styling settings
  const finalLayout: Partial<PlotlyLayout> = {
    ...plotlyDataLayout,
    autosize: true,
    height: height,
    margin: { l: 40, r: 15, t: 25, b: 55, ...plotlyDataLayout?.margin },
    font: { 
      family: 'Inter, system-ui, sans-serif', 
      size: 10, 
      ...plotlyDataLayout?.font 
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: true,
    xaxis: {
      showgrid: true,
      gridcolor: 'rgba(128, 128, 128, 0.15)',
      zerolinecolor: 'rgba(128, 128, 128, 0.3)',
      linecolor: 'rgba(128, 128, 128, 0.3)',
      ...plotlyDataLayout?.xaxis
    },
    yaxis: {
      showgrid: true,
      gridcolor: 'rgba(128, 128, 128, 0.15)',
      zerolinecolor: 'rgba(128, 128, 128, 0.3)',
      linecolor: 'rgba(128, 128, 128, 0.3)',
      ...plotlyDataLayout?.yaxis
    },
    legend: {
      orientation: 'h',
      xanchor: 'center', 
      yanchor: 'top',
      y: -0.3,
      x: 0.5,
      font: { size: 9 },
      itemsizing: 'constant',
      traceorder: 'normal',
      itemwidth: 30,
      itemclick: 'toggleothers',
      itemdoubleclick: 'toggle',
      xgap: 10,
      ...plotlyDataLayout?.legend
    },
    title: plotlyDataLayout?.title || (widget.name ? { text: widget.name } : undefined)
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <Plot
        data={enhancedData}
        layout={finalLayout}
        config={{ 
          responsive: true,
          displayModeBar: false,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

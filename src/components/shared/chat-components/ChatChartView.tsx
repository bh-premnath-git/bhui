import Plot from 'react-plotly.js';
import { useMemo } from 'react';

interface ChatChartViewProps {
  data: any;
}

export function ChatChartView({ data }: ChatChartViewProps) {
  if (!data) {
    return <div className="p-6 text-center text-gray-500">No data available</div>;
  }
  
  // Enhanced layout to ensure chart is responsive and fully visible
  const enhancedLayout = useMemo(() => {
    const baseLayout = data.layout || {};
    
    return {
      ...baseLayout,
      autosize: true,
      height: 300,
      margin: { 
        l: 40, 
        r: 20, 
        t: 30, 
        b: 60, 
        ...baseLayout.margin 
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      legend: {
        orientation: 'h',
        xanchor: 'center',
        yanchor: 'top',
        y: -0.2,
        x: 0.5,
        itemsizing: 'constant',
        traceorder: 'normal',
        ...baseLayout.legend,
      }
    };
  }, [data.layout]);

  // Enhanced data with square markers for consistency
  const enhancedData = useMemo(() => {
    return (data.data || []).map((trace: any) => {
      const newTrace = { ...trace };
      
      // Add square marker
      newTrace.marker = {
        ...(trace.marker || {}),
        symbol: 'square'
      };
      
      // For scatter plots, ensure consistency
      if (trace.type === 'scatter') {
        newTrace.mode = 'lines+markers';
        newTrace.line = {
          ...(trace.line || {}),
          showlegend: false
        };
      }
      
      return newTrace;
    });
  }, [data.data]);

  return (
    <div className="h-[300px] w-full">
      <Plot
        data={enhancedData}
        layout={enhancedLayout}
        config={{
          responsive: true,
          displayModeBar: false
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
import React, { useMemo } from "react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { colorPalettes } from "@/components/bh-charts"

interface GaugeChartProps {
  value: number | string;
  min?: number;
  max?: number;
  color?: string;
  label?: string;
  config?: Record<string, any>;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ 
  value, 
  min = 0, 
  max = 100, 
  color = colorPalettes.supersetColors[0],
  label,
  config = {}
}) => {
  // Process value to ensure it's numeric
  const processedValue = useMemo(() => {
    let numericValue = value;
    
    // Convert to number if it's a string (e.g., with currency symbols)
    if (typeof numericValue === 'string') {
      numericValue = Number(numericValue.replace(/[$,]/g, ''));
    }
    
    // Handle invalid or NaN values
    if (isNaN(numericValue as number)) {
      return 0;
    }
    
    // Clamp value between min and max
    return Math.max(min, Math.min(max, numericValue as number));
  }, [value, min, max]);

  // Calculate percentage and normalized value
  const percentage = ((processedValue - min) / (max - min)) * 100;
  const normalizedValue = Math.max(0, Math.min(100, percentage));
  
  // Format display value
  const displayValue = config.valueFormatter ? 
    config.valueFormatter(processedValue) : 
    processedValue.toLocaleString();
  
  // Prepare chart data
  const data = [
    { name: 'Value', value: normalizedValue },
    { name: 'Remaining', value: 100 - normalizedValue }
  ];

  // Inner and outer radius configuration
  const innerRadius = config.innerRadius || 60;
  const outerRadius = config.outerRadius || 80;
  
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            strokeWidth={config.strokeWidth || 0}
          >
            <Cell fill={color} />
            <Cell fill={config.emptyColor || "#f3f4f6"} />
          </Pie>
          <Tooltip 
            formatter={(value, name) => {
              if (name === value) {
                return [displayValue, label || 'Value'];
              }
              return [null, ''];
            }}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      
      {/* Display value in center of gauge */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[120%] text-center">
        <div className="text-2xl font-bold">{displayValue}</div>
        {config.showPercentage !== false && (
          <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
        )}
        {label && (
          <div className="text-sm font-medium mt-1">{label}</div>
        )}
      </div>
    </div>
  );
};

export default GaugeChart;
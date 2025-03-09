import React, { useMemo } from "react"
import {
  Treemap as RechartsTreemap,
  ResponsiveContainer,
  Tooltip
} from "recharts"
import { colorPalettes } from "@/components/bh-charts"

interface TreemapData {
  name: string;
  value: number | string;
  color?: string;
  children?: TreemapData[];
  [key: string]: any;
}

interface TreemapChartProps {
  data: TreemapData[] | Record<string, TreemapData[]>;
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  config?: Record<string, any>;
  isMultiSeries?: boolean;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({ 
  data, 
  dataKey,
  nameKey = "name",
  colors = colorPalettes.supersetColors,
  config = {},
  isMultiSeries = false
}) => {
  // Process data for treemap
  const processedData = useMemo(() => {
    if (!data || (Array.isArray(data) && data.length === 0)) return [];
    
    if (isMultiSeries && !Array.isArray(data)) {
      // For multi-series, create a hierarchical structure
      return Object.entries(data).map(([series, items], seriesIndex) => {
        const seriesColor = colors[seriesIndex % colors.length];
        
        // Process items in this series
        const children = items.map((item, itemIndex) => {
          const value = typeof item[dataKey] === 'string'
            ? Number(item[dataKey].toString().replace(/[$,]/g, ''))
            : Number(item[dataKey]);
            
          return {
            name: item[nameKey],
            value: isNaN(value) ? 0 : value,
            color: colors[(seriesIndex * items.length + itemIndex) % colors.length]
          };
        });
        
        // Calculate series total
        const total = children.reduce((sum, item) => sum + (item.value as number), 0);
        
        return {
          name: series,
          value: total,
          color: seriesColor,
          children
        };
      });
    }
    
    // Single series processing
    return (data as TreemapData[]).map((item, index) => {
      const newItem = { ...item };
      
      // Ensure dataKey value is a number
      if (typeof newItem[dataKey] === 'string') {
        newItem[dataKey] = Number(newItem[dataKey].replace(/[$,]/g, ''));
      }
      
      // If still not a number, default to 0
      if (isNaN(newItem[dataKey])) {
        newItem[dataKey] = 0;
      }
      
      // Add color if not present
      if (!newItem.color) {
        newItem.color = colors[index % colors.length];
      }
      
      return newItem;
    });
  }, [data, dataKey, nameKey, colors, isMultiSeries]);
  
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for treemap
      </div>
    );
  }

  // Custom content for treemap cells with text labeling
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, value, depth } = props;
    
    // Only render text if the cell is large enough
    const shouldRenderText = width > 30 && height > 30;
    
    // Use different text colors and sizes based on depth
    const textColor = depth === 1 ? "#fff" : "#000";
    const fontSize = depth === 1 ? 12 : 10;
    const fontWeight = depth === 1 ? "bold" : "normal";
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.color || props.fill,
            stroke: config.stroke || "#fff",
            strokeWidth: config.strokeWidth || 2,
            fillOpacity: depth === 1 ? 1 : 0.8
          }}
        />
        {shouldRenderText && config.showLabels !== false && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 7}
              textAnchor="middle"
              fill={textColor}
              fontSize={fontSize}
              fontWeight={fontWeight}
            >
              {props[nameKey] || name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill={textColor}
              fontSize={fontSize - 2}
            >
              {config.valueFormatter ? config.valueFormatter(value) : value}
            </text>
          </>
        )}
      </g>
    );
  };

  // Handle formatter based on config
  const formatter = (value: any, name: string) => {
    // Use custom formatter if provided
    if (config.valueFormatter) {
      return [config.valueFormatter(value), name];
    }
    
    // Default formatter
    return [value.toLocaleString(), name];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsTreemap
        data={processedData}
        dataKey={dataKey}
        nameKey={nameKey}
        aspectRatio={config.aspectRatio || 4/3}
        stroke={config.stroke || "#fff"}
        fill={colors[0]}
        content={config.showCustomContent !== false ? <CustomizedContent /> : undefined}
      >
        <Tooltip 
          formatter={formatter}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        />
      </RechartsTreemap>
    </ResponsiveContainer>
  );
};

export default TreemapChart;
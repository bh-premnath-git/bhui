import { ChartConfig, ColorScheme, ChartType, AggregationMethod } from "@/types/plotly/systemtype";

interface ChartControlsProps {
    config: ChartConfig;
    colorScheme: ColorScheme;
    customColor: string;
    fields: { numeric: string[]; string: string[] };
    onConfigChange: (config: ChartConfig) => void;
    onColorSchemeChange: (scheme: ColorScheme) => void;
    onCustomColorChange: (color: string) => void;
  }
  
  export const ChartControls: React.FC<ChartControlsProps> = ({
    config,
    colorScheme,
    customColor,
    fields,
    onConfigChange,
    onColorSchemeChange,
    onCustomColorChange
  }) => {
    const updateConfig = (updates: Partial<ChartConfig>) => {
      onConfigChange({ ...config, ...updates });
    };
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-6 bg-gray-50 border-b">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Color Scheme</label>
          <select 
            className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            value={colorScheme}
            onChange={(e) => onColorSchemeChange(e.target.value as ColorScheme)}
          >
            <option value="default">Default</option>
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="blues">Blues</option>
            <option value="greens">Greens</option>
            <option value="custom">Custom</option>
          </select>
        </div>
  
        {colorScheme === 'custom' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Custom Color</label>
            <input 
              type="color" 
              className="w-full h-10 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              value={customColor}
              onChange={(e) => onCustomColorChange(e.target.value)}
            />
          </div>
        )}
  
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Chart Type</label>
          <select 
            className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            value={config.type}
            onChange={(e) => updateConfig({ type: e.target.value as ChartType })}
          >
            <option value="bar">Bar</option>
            <option value="column">Column</option>
            <option value="line">Line</option>
            <option value="scatter">Scatter</option>
            <option value="pie">Pie</option>
            <option value="histogram">Histogram</option>
            <option value="box">Box Plot</option>
            <option value="heatmap">Heatmap</option>
            <option value="number">Number</option>
          </select>
        </div>
  
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">X Axis</label>
          <select 
            className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            value={config.xField}
            onChange={(e) => updateConfig({ xField: e.target.value })}
          >
            <option value="">Select Field</option>
            {[...fields.string, ...fields.numeric].map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>
  
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Y Axis</label>
          <select 
            className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            value={config.yField}
            onChange={(e) => updateConfig({ yField: e.target.value })}
          >
            <option value="">Select Field</option>
            {fields.numeric.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>
  
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Aggregation</label>
          <select 
            className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            value={config.aggregation}
            onChange={(e) => updateConfig({ aggregation: e.target.value as AggregationMethod })}
          >
            <option value="sum">Sum</option>
            <option value="avg">Average</option>
            <option value="min">Minimum</option>
            <option value="max">Maximum</option>
          </select>
        </div>
      </div>
    );
  };
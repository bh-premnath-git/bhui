import type { ChartConfig, ColorScheme, ChartType } from "@/types/plotly/systemtype";

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
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
        {/* Color Scheme */}
        <div className="inline-flex items-center gap-2">
          <label className="sr-only" htmlFor="chart-color-scheme">Color Scheme</label>
          <select
            id="chart-color-scheme"
            className="h-8 rounded-md border border-muted-foreground/30 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
            value={colorScheme}
            onChange={(e) => onColorSchemeChange(e.target.value as ColorScheme)}
            aria-label="Color Scheme"
            title="Color Scheme"
          >
            <option value="default">Default</option>
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="blues">Blues</option>
            <option value="greens">Greens</option>
            <option value="custom">Custom</option>
          </select>
        </div>
  
        {/* Custom Color (only when custom) */}
        {colorScheme === 'custom' && (
          <div className="inline-flex items-center gap-2">
            <label className="sr-only" htmlFor="chart-custom-color">Custom Color</label>
            <input
              id="chart-custom-color"
              type="color"
              className="h-8 w-10 cursor-pointer rounded-md border border-muted-foreground/30 bg-background p-0"
              value={customColor}
              onChange={(e) => onCustomColorChange(e.target.value)}
              aria-label="Custom Color"
              title="Custom Color"
            />
          </div>
        )}
  
        {/* Divider */}
        <div className="mx-1 hidden h-5 w-px bg-muted-foreground/20 sm:block" />
  
        {/* Chart Type */}
        <div className="inline-flex items-center gap-2">
          <label className="sr-only" htmlFor="chart-type">Chart Type</label>
          <select
            id="chart-type"
            className="h-8 rounded-md border border-muted-foreground/30 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
            value={config.type}
            onChange={(e) => updateConfig({ type: e.target.value as ChartType })}
            aria-label="Chart Type"
            title="Chart Type"
          >
            <option value="bar">Bar</option>
            <option value="column">Column</option>
            <option value="line">Line</option>
            <option value="scatter">Scatter</option>
            <option value="pie">Pie</option>
            <option value="histogram">Histogram</option>
            <option value="box">Box</option>
            <option value="heatmap">Heatmap</option>
            <option value="number">Number</option>
          </select>
        </div>
  
        {/* X Axis */}
        <div className="inline-flex items-center gap-2">
          <label className="sr-only" htmlFor="chart-x">X Axis</label>
          <select
            id="chart-x"
            className="h-8 min-w-[10rem] rounded-md border border-muted-foreground/30 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
            value={config.xField}
            onChange={(e) => updateConfig({ xField: e.target.value })}
            aria-label="X Axis"
            title="X Axis"
          >
            <option value="">X Axis</option>
            {[...fields.string, ...fields.numeric].map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
  
        {/* Y Axis */}
        <div className="inline-flex items-center gap-2">
          <label className="sr-only" htmlFor="chart-y">Y Axis</label>
          <select
            id="chart-y"
            className="h-8 min-w-[10rem] rounded-md border border-muted-foreground/30 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/40"
            value={config.yField}
            onChange={(e) => updateConfig({ yField: e.target.value })}
            aria-label="Y Axis"
            title="Y Axis"
          >
            <option value="">Y Axis</option>
            {fields.numeric.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };
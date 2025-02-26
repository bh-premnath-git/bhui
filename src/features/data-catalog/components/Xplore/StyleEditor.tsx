import { useAnalytics } from "@/context/AnalyticsContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  LineChart, 
  PieChart,
  Activity, // For Area Chart
  CircleDot, // For Scatter Plot
  Timer, // For Gauge
  LayoutGrid, // For Treemap
  BarChart3, // For Histogram
  Circle, // For Bubble Chart
  Radar // For Radar Chart
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { colorPalettes, generateColorPalette } from "@/lib/colors";
import { cn } from "@/lib/utils";

export default function StyleEditor() {
  const { chartStyles, setChartStyles, data } = useAnalytics();

  const chartTypes = [
    { 
      id: 'bar' as const, 
      icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="12" width="4" height="8" className="fill-current"/>
          <rect x="10" y="8" width="4" height="12" className="fill-current"/>
          <rect x="16" y="4" width="4" height="16" className="fill-current"/>
        </svg>
      ),
      label: 'Column',
      category: 'Basic'
    },
    { 
      id: 'line' as const, 
      icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 18L9 12L14 16L20 6" className="stroke-current" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Line',
      category: 'Basic'
    },
    { 
      id: 'pie' as const, 
      icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12L12 5" className="stroke-current" strokeWidth="2"/>
          <path d="M12 12L17 17" className="stroke-current" strokeWidth="2"/>
          <circle cx="12" cy="12" r="7" className="stroke-current" strokeWidth="2"/>
          <path d="M12 5C15.866 5 19 8.13401 19 12C19 13.9587 18.2203 15.7295 16.9497 17" className="stroke-current" strokeWidth="2"/>
        </svg>
      ),
      label: 'Pie',
      category: 'Basic'
    },
    { 
      id: 'area' as const, 
      icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 18L9 12L14 16L20 6V18H4Z" className="fill-current opacity-20"/>
          <path d="M4 18L9 12L14 16L20 6" className="stroke-current" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Area',
      category: 'Basic'
    },
    // { 
    //   id: 'scatter' as const, 
    //   icon: CircleDot, 
    //   label: 'Scatter Plot',
    //   description: 'Identify correlations between variables',
    //   category: 'Advanced'
    // },
    // { 
    //   id: 'gauge' as const, 
    //   icon: Timer, 
    //   label: 'Gauge Chart',
    //   description: 'Display progress towards a goal',
    //   category: 'Advanced'
    // },
    // { 
    //   id: 'treemap' as const, 
    //   icon: LayoutGrid, 
    //   label: 'Treemap',
    //   description: 'Hierarchical data with nested rectangles',
    //   category: 'Advanced'
    // },
    // { 
    //   id: 'histogram' as const, 
    //   icon: BarChart3, 
    //   label: 'Histogram',
    //   description: 'Show distribution of data',
    //   category: 'Advanced'
    // },
    // { 
    //   id: 'bubble' as const, 
    //   icon: Circle, 
    //   label: 'Bubble Chart',
    //   description: 'Compare three dimensions of data',
    //   category: 'Advanced'
    // },
    // { 
    //   id: 'radar' as const, 
    //   icon: Radar, 
    //   label: 'Radar Chart',
    //   description: 'Compare multiple variables',
    //   category: 'Advanced'
    // }
  ] as const;

  // Group charts by category
  const chartsByCategory = chartTypes.reduce((acc, chart) => {
    if (!acc[chart.category]) {
      acc[chart.category] = [];
    }
    acc[chart.category].push(chart);
    return acc;
  }, {} as Record<string, typeof chartTypes>);

  // Get number of data columns (excluding date/time columns)
  const getDataColumnCount = () => {
    if (!data || data.length === 0) return 4; // default fallback
    const firstRow = data[0];
    // Exclude date/time columns or any other metadata columns
    return Object.keys(firstRow).filter(key => !key.toLowerCase().includes('date')).length;
  };

  const colorThemes = {
    colorful: [
      {
        id: 'colorful1',
        name: 'Colorful 1',
        colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
      },
      {
        id: 'colorful2',
        name: 'Colorful 2',
        colors: ['#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#393b79', '#637939']
      },
      {
        id: 'colorful3',
        name: 'Colorful 3',
        colors: ['#8c6d31', '#843c39', '#7b4173', '#5254a3', '#006d2c', '#a63603']
      },
      {
        id: 'colorful4',
        name: 'Colorful 4',
        colors: ['#3182bd', '#e6550d', '#31a354', '#756bb1', '#636363', '#6baed6']
      },
      {
        id: 'colorful5',
        name: 'Colorful 5',
        colors: ['#9e9ac8', '#fd8d3c', '#74c476', '#969696', '#e377c2', '#7f7f7f']
      }
    ],
    monochromatic: [
      {
        id: 'mono_blue',
        name: 'Blue Scale',
        colors: ['#08519c', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#eff3ff']
      },
      {
        id: 'mono_brown',
        name: 'Brown Scale',
        colors: ['#8c2d04', '#cc4c02', '#ec7014', '#fe9929', '#fec44f', '#fff7bc']
      },
      {
        id: 'mono_green',
        name: 'Green Scale',
        colors: ['#005a32', '#238b45', '#41ab5d', '#74c476', '#a1d99b', '#c7e9c0']
      },
      {
        id: 'mono_purple',
        name: 'Purple Scale',
        colors: ['#4a1486', '#6a51a3', '#807dba', '#9e9ac8', '#bcbddc', '#dadaeb']
      }
    ]
  };

  const handleColorSchemeChange = (scheme: typeof colorThemes.colorful[0] | typeof colorThemes.monochromatic[0]) => {
    setChartStyles({ 
      ...chartStyles,
      colorScheme: scheme.id,
      colors: scheme.colors
    });
  };

  return (
    <div className="w-full space-y-8">
      {/* Chart Types Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Chart Types</h2>
        <div className="space-y-8">
          {Object.entries(chartsByCategory).map(([category, charts]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                {category} Charts
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {charts.map(({ id, icon: Icon, label }) => (
                  <TooltipProvider key={id}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "group relative w-full p-4 rounded-lg border transition-all duration-200",
                            "hover:shadow-sm hover:border-primary/50 hover:bg-primary/5",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                            "active:scale-[0.98]",
                            chartStyles.chartType === id ? 
                              "bg-primary/5 border-primary shadow-sm" : 
                              "bg-background hover:bg-muted/5"
                          )}
                          onClick={() => setChartStyles({ ...chartStyles, chartType: id })}
                        >
                          <div className={cn(
                            "flex items-center justify-center",
                            "w-full h-12 rounded-md",
                            "transition-colors duration-200",
                            chartStyles.chartType === id ?
                              "text-primary" :
                              "text-muted-foreground group-hover:text-primary"
                          )}>
                            <Icon />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="flex flex-col gap-1">
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          Best for: {getChartUsage(id)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Schemes Section */}
      <div className="space-y-6 pt-4 border-t">
        <h2 className="text-lg font-semibold">Color Schemes</h2>
        <div className="space-y-8">
          {/* Colorful Themes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground px-1">
              Colorful
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {colorThemes.colorful.map((theme) => (
                <button
                  key={theme.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    "hover:shadow-md hover:border-primary/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    chartStyles.colorScheme === theme.id && "ring-2 ring-primary"
                  )}
                  onClick={() => handleColorSchemeChange(theme)}
                >
                  <div className="grid grid-cols-3 gap-1">
                    {theme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Monochromatic */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground px-1">
              Monochromatic
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {colorThemes.monochromatic.map((theme) => (
                <button
                  key={theme.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    "hover:shadow-md hover:border-primary/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    chartStyles.colorScheme === theme.id && "ring-2 ring-primary"
                  )}
                  onClick={() => handleColorSchemeChange(theme)}
                >
                  <div className="grid grid-cols-3 gap-1">
                    {theme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get chart usage
function getChartUsage(chartType: string): string {
  const usageMap: Record<string, string> = {
    bar: 'Comparison',
    line: 'Trends',
    area: 'Part-to-whole',
    pie: 'Distribution',
    scatter: 'Correlation',
    gauge: 'Single metric',
    treemap: 'Hierarchy',
    histogram: 'Distribution',
    bubble: 'Multi-dimension',
    radar: 'Multi-variable'
  };
  return usageMap[chartType] || '';
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function StyleEditor() {
  const { chartStyles, setChartStyles } = useAnalytics();

  const chartTypes = [
    { 
      id: 'bar' as const, 
      icon: BarChart, 
      label: 'Bar Chart',
      description: 'Compare values across categories',
      category: 'Basic'
    },
    { 
      id: 'line' as const, 
      icon: LineChart, 
      label: 'Line Chart',
      description: 'Show trends over time',
      category: 'Basic'
    },
    { 
      id: 'area' as const, 
      icon: Activity, 
      label: 'Area Chart',
      description: 'Visualize cumulative totals over time',
      category: 'Basic'
    },
    { 
      id: 'pie' as const, 
      icon: PieChart, 
      label: 'Pie Chart',
      description: 'Show proportions of a whole',
      category: 'Basic'
    },
    { 
      id: 'scatter' as const, 
      icon: CircleDot, 
      label: 'Scatter Plot',
      description: 'Identify correlations between variables',
      category: 'Advanced'
    },
    { 
      id: 'gauge' as const, 
      icon: Timer, 
      label: 'Gauge Chart',
      description: 'Display progress towards a goal',
      category: 'Advanced'
    },
    { 
      id: 'treemap' as const, 
      icon: LayoutGrid, 
      label: 'Treemap',
      description: 'Hierarchical data with nested rectangles',
      category: 'Advanced'
    },
    { 
      id: 'histogram' as const, 
      icon: BarChart3, 
      label: 'Histogram',
      description: 'Show distribution of data',
      category: 'Advanced'
    },
    { 
      id: 'bubble' as const, 
      icon: Circle, 
      label: 'Bubble Chart',
      description: 'Compare three dimensions of data',
      category: 'Advanced'
    },
    { 
      id: 'radar' as const, 
      icon: Radar, 
      label: 'Radar Chart',
      description: 'Compare multiple variables',
      category: 'Advanced'
    }
  ] as const;

  // Group charts by category
  const chartsByCategory = chartTypes.reduce((acc, chart) => {
    if (!acc[chart.category]) {
      acc[chart.category] = [];
    }
    acc[chart.category].push(chart);
    return acc;
  }, {} as Record<string, typeof chartTypes>);

  const colorSchemes = {
    predefined: [
      { 
        id: 'sophisticated', 
        name: 'Sophisticated',
        colors: [
          '#2E4053', // Deep navy
          '#008080', // Vibrant teal
          '#FFD700', // Warm gold
          '#94A3B8'  // Medium slate gray (replacing light gray)
        ] 
      },
      { 
        id: 'energetic',
        name: 'Energetic', 
        colors: [
          '#1E90FF', // Electric blue
          '#FF69B4', // Bright magenta
          '#32CD32', // Lime green
          '#64748B'  // Cool gray (replacing light gray)
        ] 
      },
      { 
        id: 'minimalist',
        name: 'Minimalist', 
        colors: [
          '#36454F', // Charcoal gray
          '#6495ED', // Muted blue
          '#F08080', // Subtle coral
          '#475569'  // Slate gray (replacing off-white)
        ] 
      }
    ],
    custom: [
      { id: 'custom1', color: '#FFFFFF' },
      { id: 'custom2', color: '#FFFFFF' },
      { id: 'custom3', color: '#FFFFFF' }
    ]
  };

  const handleColorSchemeChange = (scheme: typeof colorSchemes.predefined[0]) => {
    console.log('Updating colors to:', scheme.colors);
    setChartStyles({ 
      ...chartStyles,
      colorScheme: scheme.id as 'sophisticated' | 'energetic' | 'minimalist',
      colors: [...scheme.colors]
    });
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="step1" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-8">
          <TabsTrigger 
            value="step1" 
            className="data-[state=active]:bg-primary/10 data-[state=active]:font-medium"
          >
            Charts
          </TabsTrigger>
          <TabsTrigger value="step2">Color</TabsTrigger>
        </TabsList>

        <TabsContent value="step1">
          <div className="space-y-8">
            {Object.entries(chartsByCategory).map(([category, charts]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground px-1 py-2">
                  {category} Charts
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {charts.map(({ id, icon: Icon, label }) => (
                    <TooltipProvider key={id}>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            className={`
                              group relative flex items-center justify-center
                              p-4
                              rounded-md border border-border/50 
                              transition-all duration-200 
                              hover:shadow-sm hover:border-primary/50 hover:bg-primary/5
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20
                              active:scale-[0.98]
                              ${chartStyles.chartType === id 
                                ? 'bg-primary/5 border-primary shadow-sm' 
                                : 'bg-background hover:bg-muted/5'
                              }
                            `}
                            onClick={() => setChartStyles({ ...chartStyles, chartType: id })}
                          >
                            <div className={`
                              flex items-center justify-center
                              w-12 h-12 rounded-md
                              transition-colors duration-200
                              ${chartStyles.chartType === id 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                              }
                            `}>
                              <Icon className="h-6 w-6" />
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
        </TabsContent>

        <TabsContent value="step2" className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Select Color Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {colorSchemes.predefined.map((scheme) => (
                <Button
                  key={scheme.id}
                  variant="outline"
                  className={`h-20 ${
                    chartStyles.colorScheme === scheme.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleColorSchemeChange(scheme)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium">{scheme.name}</span>
                    <div className="flex gap-2">
                      {scheme.colors.map((color) => (
                        <div
                          key={color}
                          className="w-6 h-6 rounded-full shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {colorSchemes.custom.map((slot) => (
              <div
                key={slot.id}
                className="h-8 rounded border cursor-pointer"
                style={{ backgroundColor: slot.color }}
                onClick={() => {
                  // Implement color picker functionality
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
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
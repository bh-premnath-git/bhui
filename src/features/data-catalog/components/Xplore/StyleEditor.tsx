import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/context/AnalyticsContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "lucide-react";

export default function StyleEditor() {
  const { chartStyles, setChartStyles } = useAnalytics();

  const chartTypes = [
    { id: 'bar' as const, icon: BarChart, label: 'Bar Chart' },
    { id: 'line' as const, icon: LineChart, label: 'Line Chart' },
    { id: 'pie' as const, icon: PieChart, label: 'Pie Chart' }
  ] as const;

  const colorSchemes = {
    predefined: [
      { 
        id: 'default', 
        name: 'Default',
        colors: ['#4B9EFF', '#45D483', '#FFB547', '#FF6B6B'] 
      },
      { 
        id: 'monochrome',
        name: 'Monochrome', 
        colors: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6'] 
      },
      { 
        id: 'colorful',
        name: 'Colorful', 
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'] 
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
      colorScheme: scheme.id as 'default' | 'monochrome' | 'colorful',
      colors: [...scheme.colors]
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="step1" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="step1">Charts</TabsTrigger>
          <TabsTrigger value="step2">Color</TabsTrigger>
        </TabsList>

        <TabsContent value="step1" className="mt-6">
          <div className="grid grid-cols-3 gap-4">
            {chartTypes.map(({ id, icon: Icon, label }) => (
              <Card
                key={id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  chartStyles.chartType === id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setChartStyles({ ...chartStyles, chartType: id })}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="h-8 w-8" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="step2" className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Select Predefined Colors</h3>
            <div className="grid grid-cols-2 gap-2">
              {colorSchemes.predefined.map((scheme) => (
                <Button
                  key={scheme.id}
                  variant="outline"
                  className={`h-16 ${
                    chartStyles.colorScheme === scheme.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleColorSchemeChange(scheme)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm">{scheme.name}</span>
                    <div className="flex gap-2">
                      {scheme.colors.map((color) => (
                        <div
                          key={color}
                          className="w-4 h-4 rounded-full"
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
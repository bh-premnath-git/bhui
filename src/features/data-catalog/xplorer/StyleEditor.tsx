import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function StyleEditor() {
  const { chartStyles, setChartStyles } = useAnalytics();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-sm font-medium">Chart Type</Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`p-2 text-sm border rounded-md ${
              chartStyles.chartType === "bar" ? "bg-accent" : ""
            }`}
            onClick={() => setChartStyles({ chartType: "bar" })}
          >
            Bar Chart
          </button>
          <button
            className={`p-2 text-sm border rounded-md ${
              chartStyles.chartType === "line" ? "bg-accent" : ""
            }`}
            onClick={() => setChartStyles({ chartType: "line" })}
          >
            Line Chart
          </button>
          <button
            className={`p-2 text-sm border rounded-md ${
              chartStyles.chartType === "pie" ? "bg-accent" : ""
            }`}
            onClick={() => setChartStyles({ chartType: "pie" })}
          >
            Pie Chart
          </button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="axes">Axes</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Chart Height</Label>
              <Slider
                value={[chartStyles.height]}
                onValueChange={([height]) => setChartStyles({ height })}
                min={200}
                max={800}
                step={50}
              />
              <div className="text-xs text-muted-foreground text-right">
                {chartStyles.height}px
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Color Scheme</Label>
              <Select
                value={chartStyles.colorScheme}
                onValueChange={(value: "default" | "monochrome" | "colorful") => 
                  setChartStyles({ colorScheme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monochrome">Monochrome</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="colorful">Colorful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="axes" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Chart Orientation</Label>
              <Select
                value={chartStyles.orientation}
                onValueChange={(value: "vertical" | "horizontal") => 
                  setChartStyles({ orientation: value })
                }
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Chart Type</Label>
              <Select
                value={chartStyles.type}
                onValueChange={(value: "grouped" | "stacked" | "stack100") => 
                  setChartStyles({ type: value })
                }
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grouped">Grouped</SelectItem>
                  <SelectItem value="stacked">Stacked</SelectItem>
                  <SelectItem value="stack100">Stack 100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Enable Style</Label>
              <Switch
                checked={chartStyles.enableStyle}
                onCheckedChange={(enableStyle) => setChartStyles({ enableStyle })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Data Labels</Label>
              <Switch
                checked={chartStyles.showDataLabels}
                onCheckedChange={(showDataLabels) => setChartStyles({ showDataLabels })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Legend</Label>
              <Switch
                checked={chartStyles.showLegend}
                onCheckedChange={(showLegend) => setChartStyles({ showLegend })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
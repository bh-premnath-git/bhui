import { Button } from "@/components/ui/button";
import { 
  BarChart,
  LineChart,
  PieChart,
  AreaChartIcon,
  ScatterChart
} from "lucide-react";

interface QuickStyleControlsProps {
  chartStyles: ChartStyles;
  setChartStyles: (styles: Partial<ChartStyles>) => void;
}

export default function QuickStyleControls({ 
  chartStyles, 
  setChartStyles 
}: QuickStyleControlsProps) {
  const chartTypes = [
    { type: 'bar', icon: BarChart, label: 'Bar' },
    { type: 'line', icon: LineChart, label: 'Line' },
    { type: 'area', icon: AreaChartIcon, label: 'Area' },
    { type: 'pie', icon: PieChart, label: 'Pie' },
    { type: 'scatter', icon: ScatterChart, label: 'Scatter' },
  ];
  
  const setChartType = (type: string) => {
    setChartStyles({
      chartType: type
    });
  };
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">Chart:</span>
      <div className="flex gap-1">
        {chartTypes.map(chart => (
          <Button
            key={chart.type}
            size="sm"
            variant={chartStyles.chartType === chart.type ? "default" : "outline"}
            onClick={() => setChartType(chart.type)}
            className="h-8 px-2"
          >
            <chart.icon className="h-4 w-4 mr-1" />
            <span className="sr-only">{chart.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
} 
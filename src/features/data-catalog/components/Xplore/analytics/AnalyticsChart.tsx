import { Card, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, AreaChart, ScatterChart } from "@/components/bh-charts";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useMemo } from "react";

interface AnalyticsChartProps {
  data: GenericData[];
  activeFilter: string;
  formatCurrency: (value: number) => string;
}

export default function AnalyticsChart({ 
  data, 
  activeFilter,
  formatCurrency 
}: AnalyticsChartProps) {
  const { chartStyles } = useAnalytics();
  
  const selectedBrands = activeFilter ? activeFilter.split(',') : ["Dole", "Frieda's", "Goya", "Chiquita"];

  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formatCurrency
    }));
  }, [data, formatCurrency]);

  const pieData = useMemo(() => {
    if (chartStyles.chartType !== 'pie') return [];
    
    return selectedBrands.map(brand => ({
      name: brand,
      value: formattedData.reduce((sum, item) => sum + (item[brand] || 0), 0)
    }));
  }, [selectedBrands, formattedData, chartStyles.chartType]);

  const renderChart = () => {
    switch (chartStyles.chartType) {
      case 'line':
        return (
          <LineChart 
            data={formattedData}
            xAxisDataKey="date"
            lines={selectedBrands}
            colors={chartStyles.colors}
          />
        );
      case 'area':
        return (
          <AreaChart 
            data={formattedData}
            xAxisDataKey="date"
            areas={selectedBrands}
            colors={chartStyles.colors}
            stacked={true}
          />
        );
      case 'scatter':
        return (
          <ScatterChart 
            data={formattedData}
            xAxisDataKey="date"
            yAxisDataKey={selectedBrands[0]}
            groups={selectedBrands}
            colors={chartStyles.colors}
          />
        );
      case 'pie':
        return (
          <PieChart 
            data={pieData}
            dataKey="value"
            nameKey="name"
            colors={chartStyles.colors}
          />
        );
      default:
        return (
          <BarChart 
            data={formattedData}
            xAxisDataKey="date"
            bars={selectedBrands}
            colors={chartStyles.colors}
          />
        );
    }
  };

  return (
    <Card className="col-span-4">
      <CardContent className="p-6">
        {renderChart()}
      </CardContent>
    </Card>
  );
}
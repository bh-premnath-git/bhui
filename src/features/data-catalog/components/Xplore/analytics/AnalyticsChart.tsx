import { Card, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "@/components/bh-charts";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useMemo } from "react";

interface AnalyticsChartProps {
  data: any[];
  activeFilter: string | null;
  formatCurrency: (value: number) => string;
}

export default function AnalyticsChart({ 
  data, 
  activeFilter,
  formatCurrency 
}: AnalyticsChartProps) {
  const { chartStyles } = useAnalytics();
  
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formatCurrency
    }));
  }, [data, formatCurrency]);

  const selectedBrands = activeFilter ? activeFilter.split(',') : ["Dole", "Frieda's", "Goya", "Chiquita"];

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
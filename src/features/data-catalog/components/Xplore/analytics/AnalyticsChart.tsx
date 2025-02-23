import { Card, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "@/components/bh-charts";
import type { ChartStyles } from "@/types/dataops/data-ops-hub.d";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useMemo } from "react";

interface AnalyticsChartProps {
  data: any[];
  activeFilter: string | null;
  styles: ChartStyles;
  formatCurrency: (value: number) => string;
}

export default function AnalyticsChart({ 
  data, 
  activeFilter, 
  styles,
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
          />
        );
      case 'pie':
        return (
          <PieChart 
            data={pieData}
            dataKey="value"
            nameKey="name"
          />
        );
      default:
        return (
          <BarChart 
            data={formattedData}
            xAxisDataKey="date"
            bars={selectedBrands}
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Bar,
  Line,
  Pie,
  BarChart,
  LineChart,
  PieChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartStyles } from "@/types/chart";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useMemo } from "react";

interface AnalyticsChartProps {
  data: any[];
  activeFilter: string | null;
  styles: ChartStyles;
  colors: string[];
  formatCurrency: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value ? entry.payload.formatCurrency(entry.value) : '$0'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart({ 
  data, 
  activeFilter, 
  styles, 
  colors,
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
      value: formattedData.reduce((sum, item) => sum + (item[brand] || 0), 0),
      formatCurrency
    }));
  }, [selectedBrands, formattedData, chartStyles.chartType, formatCurrency]);

  const renderChart = () => {
    const commonProps = {
      width: 800,
      height: styles.height,
    };
    const commonChartComponents = (
      <>
        {chartStyles.showLegend && <Legend />}
        <Tooltip content={<CustomTooltip />} />
      </>
    );

    switch (chartStyles.chartType) {
      case 'line':
        return (
          <LineChart {...commonProps} data={formattedData}>
            {chartStyles.enableStyle && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="date" />
            <YAxis />
            {commonChartComponents}
            {selectedBrands.map((brand, index) => (
              <Line 
                key={brand}
                dataKey={brand} 
                stroke={colors[index % colors.length]} 
                type="monotone"
                label={chartStyles.showDataLabels ? {
                  position: 'top',
                  formatter: (value: number) => formatCurrency(value)
                } : false}
              />
            ))}
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={styles.height / 3}
              label={chartStyles.showDataLabels ? (entry) => `${entry.name}: ${formatCurrency(entry.value)}` : false}
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {commonChartComponents}
          </PieChart>
        );
      default:
        return (
          <BarChart {...commonProps} data={formattedData}>
            {chartStyles.enableStyle && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="date" />
            <YAxis />
            {commonChartComponents}
            {selectedBrands.map((brand, index) => (
              <Bar 
                key={brand}
                dataKey={brand} 
                fill={colors[index % colors.length]}
                label={chartStyles.showDataLabels ? {
                  position: 'top',
                  formatter: (value: number) => formatCurrency(value)
                } : false}
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <Card className="col-span-4">
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={styles.height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
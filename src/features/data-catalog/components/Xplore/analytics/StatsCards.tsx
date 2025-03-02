import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardMetric {
  brand: string;
  value: number;
  trend: string;
  status: 'increase' | 'decrease' | 'neutral';
}

interface StatsCardsProps {
  metrics: DashboardMetric[];
  activeFilter: string;
  onFilterClick: (brand: string) => void;
  formatCurrency: (value: number) => string;
}

export default function StatsCards({ 
  metrics,
  activeFilter, 
  onFilterClick,
  formatCurrency 
}: StatsCardsProps) {
  const isSelected = (brand: string) => {
    if (!activeFilter) return false;
    return activeFilter.split(',').includes(brand);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card
          key={metric.brand}
          className={`cursor-pointer transition-all hover:shadow-md ${
            isSelected(metric.brand) ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onFilterClick(metric.brand)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{metric.brand}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metric.value)}
            </div>
            <div className={`text-sm ${
              metric.status === 'increase' ? 'text-green-600' : 
              metric.status === 'decrease' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {metric.trend}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
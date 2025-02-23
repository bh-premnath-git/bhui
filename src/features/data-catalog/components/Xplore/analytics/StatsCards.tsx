import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  data: any[];
  activeFilter: string | null;
  onFilterClick: (brand: string) => void;
  formatCurrency: (value: number | undefined) => string;
}

export default function StatsCards({ 
  data, 
  activeFilter, 
  onFilterClick,
  formatCurrency 
}: StatsCardsProps) {
  const brands = ["Dole", "Frieda's", "Goya", "Chiquita"];
  
  const isSelected = (brand: string) => {
    if (!activeFilter) return false;
    return activeFilter.includes(brand);
  };

  const getLatestValue = (brand: string): number => {
    if (!data || data.length === 0) return 0;
    const latestData = data[0];
    return latestData[brand] || 0;
  };
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {brands.map((brand) => (
        <Card 
          key={brand}
          className={`cursor-pointer transition-all hover:shadow-md ${
            isSelected(brand) ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onFilterClick(brand)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{brand}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(getLatestValue(brand))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  data: any[];
  activeFilter: string | null;
  onFilterClick: (brand: string) => void;
  formatCurrency: (value: number) => string;
}

export default function StatsCards({ 
  data, 
  activeFilter, 
  onFilterClick,
  formatCurrency 
}: StatsCardsProps) {
  const brands = ["Dole", "Frieda's", "Goya", "Chiquita"];
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {brands.map((brand) => (
        <Card 
          key={brand}
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === brand ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onFilterClick(brand)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{brand}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data[0]?.[brand as keyof typeof data[0]] || 0)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
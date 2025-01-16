import { Card, CardContent } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartStyles } from "@/hooks/useChartStyles";

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
  const formattedData = data.map(item => ({
    ...item,
    formatCurrency
  }));

  return (
    <Card className="col-span-4">
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={styles.height}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {!activeFilter ? (
              <>
                <Bar dataKey="Dole" fill={colors[0]} />
                <Bar dataKey="Frieda's" fill={colors[1]} />
                <Bar dataKey="Goya" fill={colors[2]} />
                <Bar dataKey="Chiquita" fill={colors[3]} />
              </>
            ) : (
              <Bar dataKey={activeFilter} fill={colors[0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
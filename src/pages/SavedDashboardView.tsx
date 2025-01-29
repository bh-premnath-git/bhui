import { useParams, useNavigate } from 'react-router-dom';
import { useDashboard } from "@/contexts/DashboardContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AnalyticsChart from "@/components/Xplore/analytics/AnalyticsChart";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useEffect } from 'react';

export default function SavedDashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savedDashboards } = useDashboard();
  const { formatCurrency, setChartStyles } = useAnalytics();
  const { getColorSchemeColors } = useColorScheme();

  const dashboard = savedDashboards.find(d => d.id === id);

  useEffect(() => {
    if (dashboard?.styles) {
      setChartStyles(dashboard.styles);
    }
  }, [dashboard?.styles, setChartStyles]);

  if (!dashboard) {
    return <div>Dashboard not found</div>;
  }

  const colors = getColorSchemeColors(dashboard.styles.colorScheme);

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{dashboard.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/data-catalog/xplore')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <AnalyticsChart 
            data={dashboard.data}
            activeFilter={null}
            styles={dashboard.styles}
            colors={colors}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>
    </div>
  );
}
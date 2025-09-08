import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { openPanel } from '@/store/slices/chat/inspectorSlice';
import { setThreeColumn } from '@/store/slices/chat/layoutSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Database, 
  Settings, 
  TrendingDown, 
  HelpCircle, 
  History, 
  MousePointer, 
  FileText,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import type { PanelId } from '@/store/slices/chat/inspectorSlice';

const mockData = [
  { date: '2024-01', revenue: 45000, units: 320 },
  { date: '2024-02', revenue: 52000, units: 380 },
  { date: '2024-03', revenue: 48000, units: 350 },
  { date: '2024-04', revenue: 61000, units: 420 },
  { date: '2024-05', revenue: 55000, units: 390 },
  { date: '2024-06', revenue: 67000, units: 480 },
];

const toolbarButtons = [
  { id: 'filters', label: 'Filters', icon: Filter },
  { id: 'fields', label: 'Fields', icon: Database },
  { id: 'chart-options', label: 'Chart Options', icon: Settings },
  { id: 'drilldown', label: 'Drill Down', icon: TrendingDown },
  { id: 'explain', label: 'Explain', icon: HelpCircle },
  { id: 'history', label: 'History', icon: History },
  { id: 'selection', label: 'Selection', icon: MousePointer },
  { id: 'annotations', label: 'Annotations', icon: FileText },
];

export const DataExplorerRenderer = () => {
  const dispatch = useAppDispatch();
  const { status, data } = useAppSelector(state => state.render);
  
  // Extract dynamic content from the render data
  const currentQuery = (data.currentQuery as string) || 'Explore data';
  const timestamp = data.timestamp ? new Date(data.timestamp as number).toLocaleTimeString() : new Date().toLocaleTimeString();

  const handleToolbarAction = (panelId: PanelId) => {
    dispatch(openPanel(panelId));
    dispatch(setThreeColumn());
  };

  if (status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data explorer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Title: &quot;{currentQuery}&quot;
            </p>
            <p className="text-xs text-muted-foreground">
              Analyzed in: {timestamp}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-border bg-surface-elevated">
        <div className="flex flex-wrap gap-2">
          {toolbarButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Button
                key={button.id}
                variant="panel"
                size="sm"
                onClick={() => handleToolbarAction(button.id as PanelId)}
                className="h-8"
              >
                <Icon className="w-4 h-4" />
                {button.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="flex-1 p-6">
        <Card className="h-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly revenue and unit sales</p>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <BarChart3 className="w-3 h-3 mr-1" />
              Bar Chart
            </Badge>
          </div>

          {/* Mock Chart */}
          <div className="relative h-64 bg-surface-elevated rounded-lg p-4 border border-border">
            <div className="absolute inset-4 flex items-end justify-between">
              {mockData.map((item, index) => {
                const height = (item.revenue / 70000) * 100;
                return (
                  <div key={item.date} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 bg-gradient-primary rounded-t transition-all duration-500 hover:shadow-glow cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${item.date}: $${item.revenue.toLocaleString()}`}
                    />
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Summary */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">$328K</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-accent">2,340</div>
              <div className="text-sm text-muted-foreground">Units Sold</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-success">+15.2%</div>
              <div className="text-sm text-muted-foreground">Growth Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-warning">$140</div>
              <div className="text-sm text-muted-foreground">Avg Order</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
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
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import type { PanelId } from '@/store/slices/chat/inspectorSlice';

const toolbarButtons = [
  { id: 'filters', label: 'Filters', icon: Filter },
  { id: 'fields', label: 'Fields', icon: Database },
  { id: 'chart-options', label: 'Chart Options', icon: Settings },
  { id: 'drilldown', label: 'Drill Down', icon: TrendingDown },
];

export const DataExplorerRenderer = () => {
  const dispatch = useAppDispatch();
  const { status, data } = useAppSelector(state => state.render);
  
  // Extract dynamic content from the render data
  const currentQuery = (data.currentQuery as string) || 'Explore data';
  const timestamp = data.timestamp ? new Date(data.timestamp as number).toLocaleTimeString() : new Date().toLocaleTimeString();

  const hasData = null;

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

      {/* Toolbar (only when data is available) */}
      {hasData && (
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
      )}

      {/* Placeholder Visualization */}
      <div className="flex-1 p-6">
        <Card className="h-full p-6 flex items-center justify-center text-muted-foreground">
          No data found from stream.
        </Card>
      </div>
    </div>
  );
};
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { closePanel } from '@/store/slices/chat/inspectorSlice';
import { closePanel as closeLayoutPanel } from '@/store/slices/chat/layoutSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  X, 
  Filter, 
  Database, 
  Settings, 
  TrendingDown, 
  HelpCircle, 
  History, 
  MousePointer, 
  FileText,
  AlertCircle
} from 'lucide-react';

const getPanelIcon = (panelId: string) => {
  switch (panelId) {
    case 'filters': return <Filter className="w-4 h-4" />;
    case 'fields': return <Database className="w-4 h-4" />;
    case 'chart-options': return <Settings className="w-4 h-4" />;
    case 'drilldown': return <TrendingDown className="w-4 h-4" />;
    case 'explain': return <HelpCircle className="w-4 h-4" />;
    case 'history': return <History className="w-4 h-4" />;
    case 'selection': return <MousePointer className="w-4 h-4" />;
    case 'annotations': return <FileText className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
};

const getPanelTitle = (panelId: string) => {
  switch (panelId) {
    case 'filters': return 'Filters';
    case 'fields': return 'Fields';
    case 'chart-options': return 'Chart Options';
    case 'drilldown': return 'Drill Down';
    case 'explain': return 'Explain';
    case 'history': return 'History';
    case 'selection': return 'Selection';
    case 'annotations': return 'Annotations';
    default: return 'Panel';
  }
};

export const InspectorPanel = () => {
  const dispatch = useAppDispatch();
  const { panelId, status, data } = useAppSelector(state => state.inspector);

  const handleClose = () => {
    dispatch(closePanel());
    dispatch(closeLayoutPanel());
  };

  if (!panelId || status === 'hidden') {
    return null;
  }

  return (
    <div className="h-full bg-surface-elevated border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {getPanelIcon(panelId)}
          <h3 className="font-medium">{getPanelTitle(panelId)}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {status === 'loading' && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {status === 'ready' && (
          <div className="space-y-4">
            {/* Mock content based on panel type */}
            {panelId === 'filters' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="mt-1 p-2 border border-border rounded">
                    Last 30 days
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Sales</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Marketing</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {panelId === 'fields' && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Dimensions</h4>
                  <div className="space-y-1">
                    <div className="p-2 bg-surface rounded text-sm">Date</div>
                    <div className="p-2 bg-surface rounded text-sm">Category</div>
                    <div className="p-2 bg-surface rounded text-sm">Region</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Measures</h4>
                  <div className="space-y-1">
                    <div className="p-2 bg-surface rounded text-sm">Revenue</div>
                    <div className="p-2 bg-surface rounded text-sm">Units Sold</div>
                  </div>
                </div>
              </div>
            )}

            {panelId === 'chart-options' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Chart Type</label>
                  <select className="w-full mt-1 p-2 border border-border rounded bg-surface">
                    <option>Line Chart</option>
                    <option>Bar Chart</option>
                    <option>Scatter Plot</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Color Scheme</label>
                  <div className="mt-1 flex gap-2">
                    <div className="w-6 h-6 bg-primary rounded"></div>
                    <div className="w-6 h-6 bg-accent rounded"></div>
                    <div className="w-6 h-6 bg-warning rounded"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Default content for other panels */}
            {!['filters', 'fields', 'chart-options'].includes(panelId) && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  {getPanelTitle(panelId)} panel content will be loaded here.
                </p>
              </Card>
            )}
          </div>
        )}

        {status === 'error' && (
          <Card className="p-4 border-destructive/50">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Failed to load panel content</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
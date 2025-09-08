import { useAppSelector } from '@/hooks/useRedux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Settings, 
  Download,
  ArrowRight,
  Database,
  Workflow,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const mockPipelineStages = [
  {
    id: 'ingestion',
    name: 'Data Ingestion',
    status: 'complete',
    description: 'Fetch data from multiple sources',
    icon: Database,
    duration: '2.3s',
  },
  {
    id: 'validation',
    name: 'Data Validation',
    status: 'running',
    description: 'Validate schema and data quality',
    icon: CheckCircle,
    duration: '1.1s',
  },
  {
    id: 'transformation',
    name: 'Data Transformation',
    status: 'pending',
    description: 'Apply business logic and transformations',
    icon: Workflow,
    duration: '--',
  },
  {
    id: 'loading',
    name: 'Data Loading',
    status: 'pending',
    description: 'Store processed data in warehouse',
    icon: Database,
    duration: '--',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'complete':
      return <CheckCircle className="w-4 h-4 text-success" />;
    case 'running':
      return <Clock className="w-4 h-4 text-primary animate-pulse" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'complete':
      return 'bg-success/10 text-success border-success/20';
    case 'running':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'error':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const PipelineRenderer = () => {
  const { status, data } = useAppSelector(state => state.render);
  
  // Extract dynamic content from the render data
  const currentQuery = (data.currentQuery as string) || 'Create a data pipeline';
  const timestamp = data.timestamp ? new Date(data.timestamp as number).toLocaleTimeString() : new Date().toLocaleTimeString();

  if (status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Data Pipeline</h2>
            <p className="text-muted-foreground">Based on: &quot;{currentQuery}&quot;</p>
            <p className="text-xs text-muted-foreground mt-1">Updated: {timestamp}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
              Configure
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="default" size="sm">
              <Play className="w-4 h-4" />
              Run Pipeline
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          
        </div>

        {/* Pipeline Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          
        </div>
      </div>
    </div>
  );
};
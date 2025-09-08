import { useAppSelector } from '@/hooks/useRedux';
import { PipelineRenderer } from '@/components/renderers/PipelineRenderer';
import { DataExplorerRenderer } from '@/components/renderers/DataExplorerRenderer';
import { WipPlaceholder } from '@/components/renderers/WipPlaceholder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const RendererHost = () => {
  const { rendererId, status, error } = useAppSelector(state => state.render);

  if (status === 'error' && error) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-surface">
        <Alert className="max-w-md border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderContent = () => {
    switch (rendererId) {
      case 'pipeline-renderer':
        return <PipelineRenderer />;
      case 'data-explorer-renderer':
        return <DataExplorerRenderer />;
      case 'wip-placeholder':
      default:
        return <WipPlaceholder />;
    }
  };

  return (
    <div className="h-full bg-surface">
      {renderContent()}
    </div>
  );
};
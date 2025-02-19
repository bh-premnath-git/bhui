import { useEffect } from 'react';
import { Network  } from 'lucide-react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { PipelineList } from '@/features/designers/BuildDataPipeline';
import { usePipelineManagementService } from '@/features/designers/pipeline/services/pipelineMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { usePipeline } from '@/features/designers/pipeline/hooks/usePipeline';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

export function BuildDataPipelinePage() {
  const { pipelines, isLoading, isFetching, isError } = usePipeline();
  const pipelineService = usePipelineManagementService();

  useEffect(() => {
      if(pipelines && pipelines.length > 0) {
          pipelineService.setPipelines(pipelines);
      }
  }, [pipelines]);

  if (isLoading) {
      return (
          <div className="p-6">
              <TableSkeleton />
          </div>
      );
  }

  if (isError) {
      return (
          <div className="p-6">
              <ErrorState message="Something went wrong" />
          </div>
      );
  }

  if (!pipelines || pipelines.length === 0) {
      return (
          <div className="p-6">
              <EmptyState
                  title="Welcome to Data Pipeline!"
                  description="Ready to build your data pipelines."
                  Icon={Network}
              />
          </div>
      );
  }

  return (
      <div className="p-6">
          <div className="relative">
              {isFetching && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <LoadingState className='w-40 h-40' />
                  </div>
              )}
              <PipelineList pipeline={pipelines || []} />
          </div>
      </div>
  );
}

export default withPageErrorBoundary(BuildDataPipelinePage, 'BuildDataPipeline')
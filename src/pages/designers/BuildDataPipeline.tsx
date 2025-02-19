import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { PipelineList } from '@/features/designers/BuildDataPipeline';
import { usePipelineManagementService } from '@/features/designers/pipeline/services/pipelineMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { usePipeline } from '@/features/designers/pipeline/hooks/usePipeline';
import { useEffect } from 'react';

export function BuildDataPipelinePage() {
  const { pipelines, isFetching } = usePipeline();
  const pipelineService = usePipelineManagementService();

  useEffect(() => {
      if(pipelines && pipelines.length > 0) {
          pipelineService.setPipelines(pipelines);
      }
  }, [pipelines]);

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
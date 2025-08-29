import { useEffect, useState } from 'react';
import { Network } from 'lucide-react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { PipelineList } from '@/features/designers/BuildDataPipeline';
import { usePipelineManagementService } from '@/features/designers/pipeline/services/pipelineMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { usePipeline } from '@/features/designers/pipeline/hooks/usePipeline';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Button } from '@/components/ui/button';
import CreatePipelineDialog from '@/features/designers/pipeline/components/CreatePipelineDialog';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAppDispatch } from '@/hooks/useRedux';
import { setBuildPipeLineDtl } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';

export function BuildDataPipelinePage() {
  const { pipelines, isLoading, isFetching, isError, fetchPipelineList } = usePipeline();
  const pipelineService = usePipelineManagementService();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { setPipeline_id, setDebuggedNodesList, setDebuggedNodes } = usePipelineContext();
  
  // Handle pipeline data updates
  useEffect(() => {
    const refreshPipelineList = async () => {
      try {
        // Force a refetch of pipeline data
        await fetchPipelineList(true);
        // Force component refresh
        setForceRefresh(prev => prev + 1);
      } catch (error) {
        console.error('Error refreshing pipeline list:', error);
      }
    };
    
    // Listen for the list updated event
    window.addEventListener('pipelineListUpdated', refreshPipelineList);
    
    return () => {
      window.removeEventListener('pipelineListUpdated', refreshPipelineList);
    };
  }, [fetchPipelineList]);

  useEffect(() => {
    if (Array.isArray(pipelines) && pipelines.length > 0) {
      pipelineService.setPipelines(pipelines);
      
      // Auto-navigate to the first pipeline if available
      const firstPipeline = pipelines[0];
      if (firstPipeline && firstPipeline.pipeline_id) {
        setDebuggedNodesList([]);
        setDebuggedNodes([]);
        setPipeline_id(firstPipeline.pipeline_id);
        dispatch(setBuildPipeLineDtl(firstPipeline));
        localStorage.setItem("pipeline_id", firstPipeline.pipeline_id.toString());
        navigate(ROUTES.DESIGNERS.BUILD_PLAYGROUND(firstPipeline.pipeline_id.toString()));
      }
    }
  }, [pipelines, pipelineService, navigate, dispatch, setPipeline_id, setDebuggedNodesList, setDebuggedNodes]);

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
        <ErrorState
          title="Error Loading Pipelines"
          description="There was an error loading the pipelines. Please try again later."
        />
      </div>
    );
  }

  if (!Array.isArray(pipelines) || pipelines.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          Icon={Network}
          title="No Pipelines Found"
          description="Get started by creating a new data pipeline."
          action={
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4"
            >
              Create Pipeline
            </Button>
          }
        />
        <CreatePipelineDialog open={createDialogOpen} handleClose={() => setCreateDialogOpen(false)} />
      </div>
    );
  }

  return (
    <div className="p-6" key={forceRefresh}>  {/* Use key to force re-render */}
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState fullScreen={true} className='w-40 h-40' />
          </div>
        )}
        <PipelineList pipeline={pipelines} />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(BuildDataPipelinePage, 'BuildDataPipeline');
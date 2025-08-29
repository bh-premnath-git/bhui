import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import DataPipelineCanvasNew from '@/features/designers/DataPipelineCanvasNew';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePipeline } from '@/features/designers/pipeline/hooks/usePipeline';
import { ROUTES } from '@/config/routes';
import { useAppDispatch } from '@/hooks/useRedux';
import { setBuildPipeLineDtl } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import CreatePipelineDialog from '@/features/designers/pipeline/components/CreatePipelineDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DataPipelineCanvasPage = () => {
  const { id } = useParams();
  const [isInitializing, setIsInitializing] = useState(true);
  const { pipelines, isLoading } = usePipeline();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { setPipeline_id, setDebuggedNodesList, setDebuggedNodes,pipelines:pipelineContextPipelines } = usePipelineContext();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Handle initial page load
  useEffect(() => {
    // Show loading state briefly to ensure components initialize properly
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Track ID changes
  useEffect(() => {
    // Reset initializing state when ID changes
    if (!isInitializing && id) {
      setIsInitializing(true);
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [id, isInitializing]);
  
  // If no ID is provided, redirect to the first pipeline or stay on the page to show create pipeline
  useEffect(() => {
    // Only proceed if pipelines are loaded and we don't have an ID
    if (!isLoading && !id) {
      if (Array.isArray(pipelines) && pipelines.length > 0) {
        // Redirect to the first pipeline
        const firstPipeline:any = pipelines[0];
        setDebuggedNodesList([]);
        setDebuggedNodes([]);
        setPipeline_id(firstPipeline.pipeline_id);
        dispatch(setBuildPipeLineDtl(firstPipeline));
        localStorage.setItem("pipeline_id", firstPipeline.pipeline_id.toString());
        navigate(ROUTES.DESIGNERS.BUILD_PLAYGROUND(firstPipeline.pipeline_id.toString()), { replace: true });
      }
      // If no pipelines, we'll stay on this page and show the create pipeline UI
    }
  }, [id, pipelines, isLoading, navigate, dispatch, setPipeline_id, setDebuggedNodesList, setDebuggedNodes,createDialogOpen]);
  
  return (
    <div className="h-full w-full relative flex items-center justify-center">
      {Array.isArray(pipelineContextPipelines) && pipelineContextPipelines.length === 0 ? (
        <>
          {/* <button
            className="px-6 py-3 bg-primary text-white rounded shadow hover:bg-primary/90 transition"
            onClick={() => setCreateDialogOpen(true)}
            data-testid="create-pipeline-btn"
          >
            Create Pipeline
          </button> */}
          <div className="p-6">
        <EmptyState
          Icon={Workflow}
          title="No Pipeline Found"
          description="Get started by creating a new pipeline."
          action={
            <Button 
            onClick={() => setCreateDialogOpen(true)}
              className="mt-4"
            >
              Create Pipeline
            </Button>
          }
        />
      </div>
          <CreatePipelineDialog
            open={createDialogOpen}
            handleClose={() => setCreateDialogOpen(false)}
          />
        </>
      ) : (
        <DataPipelineCanvasNew gitIntegration={true} />
      )}
    </div>
  );
};

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas');
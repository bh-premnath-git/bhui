import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import DataPipelineCanvas  from '@/features/designers/DataPipelineCanvas';
import { PipelineProvider } from '@/context/designers/DataPipelineContext';

const DataPipelineCanvasPage = () => {
  return (
    <div className="h-screen w-full">
      <PipelineProvider>
        <DataPipelineCanvas />
      </PipelineProvider>
    </div>
  )
}

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas')
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import DataPipelineCanvas  from '@/features/designers/DataPipelineCanvas';
import { PipelineProvider } from '@/context/designers/DataPipelineContext';

const DataPipelineCanvasPage = () => {
  return (
    <div className="h-[90%] w-full">
      {/* <SaveProvider>
      // <PipelineProvider> */}
      
        <DataPipelineCanvas />
      {/* </PipelineProvider>
      </SaveProvider> */}
    </div>
  )
}

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas')
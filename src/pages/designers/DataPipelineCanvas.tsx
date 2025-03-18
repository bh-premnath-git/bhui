import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import DataPipelineCanvas  from '@/features/designers/DataPipelineCanvas';

const DataPipelineCanvasPage = () => {
  return (
    <div className="h-[90%] w-full">
      
        <DataPipelineCanvas />
      </div>
  )
}

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas')
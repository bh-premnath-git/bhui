import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import DataPipelineCanvasNew from '@/features/designers/DataPipelineCanvasNew';

const DataPipelineCanvasPage = () => {
  return (
    <div className="h-full w-full">
      <DataPipelineCanvasNew />
      </div>
  )
}

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas')
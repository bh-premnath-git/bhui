import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import DataPipelineCanvasNew  from '@/features/designers/DataPipelineCanvasNew';

const DataPipelineCanvasPage = () => {
  return (
    <div className="h-[90%] w-full">
        <DataPipelineCanvasNew />
      </div>
  )
}

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas')
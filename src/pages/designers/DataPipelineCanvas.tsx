import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import DataPipelineCanvas from '@/features/designers/DataPipelineCanvas';
import { PipeLineChatPanel } from '@/features/designers/pipeline/components/PipeLineChatPanel';

const DataPipelineCanvasPage = () => {
  return (
    <div className="h-[90%] flex">
      <div className="w-[75%]">
        <DataPipelineCanvas />
      </div>
      <div className="h-[94vh] float-right w-[25%]">
        <PipeLineChatPanel
        />
      </div>
    </div>
  )
}

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas')
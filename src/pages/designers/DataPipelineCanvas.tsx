import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { DataPipelineCanvas } from '@/features/designers/DataPipelineCanvas';

const DataPipelineCanvasPage = () => {
  return (
    <DataPipelineCanvas />
)
}

export default withPageErrorBoundary(DataPipelineCanvasPage, 'DataPipelineCanvas')
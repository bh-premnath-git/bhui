import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { BuildDataPipeline } from '@/features/designers/BuildDataPipeline';

const BuildDataPipelinePage = () => {
  return (
    <BuildDataPipeline />
  )
}

export default withPageErrorBoundary(BuildDataPipelinePage, 'BuildDataPipeline')
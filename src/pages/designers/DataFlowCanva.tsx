import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import DataFlow from '@/features/designers/DataFlow';
import { FlowProvider } from '@/context/designers/FlowContext';

const DataFlowCanvaPage = () => {
  return (
    <div className="h-full w-[99%]"> 
      <FlowProvider>
        <DataFlow gitIntegration={true} />
      </FlowProvider>
    </div>
  )
}

export default withPageErrorBoundary(DataFlowCanvaPage, 'DataFlowCanvas');

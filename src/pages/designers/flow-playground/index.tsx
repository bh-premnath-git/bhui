import { ReactFlowProvider } from 'reactflow';
import { FlowEditor } from '@/features/designers/flow/flowdesigner'
import { FlowProvider } from '@/context/FlowContext';
const index = () => {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <FlowProvider>
          <FlowEditor />
        </FlowProvider>
      </ReactFlowProvider>
    </div>
  )
}

export default index
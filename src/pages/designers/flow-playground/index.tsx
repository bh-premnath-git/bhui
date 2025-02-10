import { ReactFlowProvider } from 'reactflow';
import {FlowEditor} from '@/features/designers/flow/flowdesigner'
const index = () => {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
    </div>
  )
}

export default index
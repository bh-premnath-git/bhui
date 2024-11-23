import { ReactFlowProvider } from 'reactflow';
import { FlowEditor } from '@/components/ReactFlowComps/flow/FlowEditor';

const FlowPlayGround = () => {
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
    </div>
  );
}
export default FlowPlayGround
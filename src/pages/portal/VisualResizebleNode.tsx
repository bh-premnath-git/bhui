import { memo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const ResizableNode = ({ data }:any) => {
  return (
    <>
      {/* <NodeResizer minWidth={100} minHeight={30} /> */}
      <Handle type="target" position={Position.Left} />
      <div style={{ padding: 10 , width:150 , textAlign:'center' }}>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(ResizableNode);
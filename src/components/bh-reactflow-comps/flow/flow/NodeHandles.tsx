import { memo } from 'react';
import { Position } from '@xyflow/react';
import { NodeHandle } from './NodeHandle';

export const NodeHandles = memo(() => (
  <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
    <NodeHandle type="target" position={Position.Left} id="left" />
    <NodeHandle type="source" position={Position.Right} id="right" />
  </div>
));
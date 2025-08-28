import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface NodeHandleProps {
  type: 'source' | 'target';
  position: Position;
  id: string;
}

const handleStyle = {
  opacity: 0,
  background: 'transparent',
  border: 'none',
  width: '2px',
  height: '2px',
};

export const NodeHandle = memo(({ type, position, id }: NodeHandleProps) => (
  <div className={`absolute ${position === Position.Left ? 'left-0' : 'right-0'} top-1/2 -translate-y-[60%] w-3 h-10`}>
    <Handle
      id={id}
      type={type}
      position={position}
      style={handleStyle}
      className="!absolute !left-0 !top-1/2 !-translate-y-1/2 !w-full !h-full hover:!bg-primary/10 transition-colors"
    />
  </div>
));
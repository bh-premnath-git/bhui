import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface NodeHandleProps {
  type: 'source' | 'target';
  position: Position;
  id: string;
}

const handleStyle = {
  opacity: 0,
  background: 'transparent',
  border: 'none',
  width: '12px',
  height: '12px',
  left: undefined,
  right: undefined,
};

export const NodeHandle = memo(({ type, position, id }: NodeHandleProps) => (
  <div className={`absolute ${position === Position.Left ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-3 h-8`}>
    <Handle
      id={id}
      type={type}
      position={position}
      style={handleStyle}
      className="!absolute !left-0 !top-1/2 !-translate-y-1/2 !w-full !h-full hover:!bg-primary/10 transition-colors"
    />
  </div>
));
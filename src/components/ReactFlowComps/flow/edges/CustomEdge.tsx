import { memo } from 'react';
import { EdgeProps, getSmoothStepPath } from 'reactflow';

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: 'rgb(148 163 184)',
      }}
      className="react-flow__edge-path transition-all duration-300 hover:stroke-primary hover:stroke-[3]"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
});
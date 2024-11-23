import { useFlow } from '@/contexts/FlowContext';
import { memo } from 'react';
import { EdgeProps, getSmoothStepPath } from 'reactflow';

export const CustomEdge = memo(({
  id,
  source,
  target,
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

  const { deleteEdgeBySourceTarget } = useFlow();

  const handleDelete = () => {
    deleteEdgeBySourceTarget(source, target);
  };

  return (
    <>
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
      <foreignObject
        x={(sourceX + targetX) / 2}
        y={(sourceY + targetY) / 2}
        width={20}
        height={20}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button
          onClick={handleDelete}
          style={{
            background: 'red',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
          }}
          title="Delete Edge"
        >
          &times;
        </button>
      </foreignObject>
    </>
  );
});
import { useFlow } from '@/context/designers/FlowContext';
import { memo, useState } from 'react';
import { EdgeProps, getSmoothStepPath } from 'reactflow';
import { Trash2 } from 'lucide-react';

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
  markerStart,
  markerEnd,
}: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
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
    <g 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 1,
          stroke: 'rgb(148 163 184)',
        }}
        className="react-flow__edge-path transition-all duration-300 hover:stroke-primary hover:stroke-[3]"
        d={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      {isHovered && (
        <foreignObject
          width={24}
          height={24}
          x={(sourceX + targetX) / 2 - 12}
          y={(sourceY + targetY) / 2 - 12}
          requiredExtensions="http://www.w3.org/1999/xhtml"
          style={{ pointerEvents: 'all' }}
        >
          <div
            className="w-full h-full flex items-center justify-center rounded-full bg-white border-2 border-red-500 hover:bg-red-50 transition-colors duration-200"
            style={{ cursor: 'pointer' }}
          >
            <button
              onClick={handleDelete}
              className="flex items-center justify-center w-full h-full p-1"
              title="Delete Edge"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        </foreignObject>
      )}
    </g>
  );
});

CustomEdge.displayName = 'CustomEdge';
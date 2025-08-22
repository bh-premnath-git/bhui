import { useFlow } from '@/context/designers/FlowContext';
import { memo, useState, useCallback } from 'react';
import { EdgeProps, getSmoothStepPath, useReactFlow } from '@xyflow/react';
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
  selected,
}: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteEdgeBySourceTarget } = useFlow();
  const { getNode } = useReactFlow();
  
  // Get source and target nodes for advanced interactions
  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  // Calculate path with improved curve for better visual flow
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16, // Smoother curves
  });

  const handleDelete = useCallback(() => {
    deleteEdgeBySourceTarget(source, target);
  }, [deleteEdgeBySourceTarget, source, target]);

  // Determine edge appearance based on selection state and hover
  const getStrokeWidth = () => {
    if (selected) return 2;
    if (isHovered) return 1.5;
    return 1;
  };

  return (
    <g 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-opacity duration-300"
    >
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: getStrokeWidth(),
          stroke: selected ? 'rgb(148 163 184)' : 'rgb(148 163 184)',
          transition: 'stroke 0.3s, stroke-width 0.3s',
        }}
        className={`react-flow__edge-path ${isHovered ? 'opacity-100' : 'opacity-80'}`}
        d={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      
      {/* Controls that appear on hover or selection */}
      {(isHovered || selected) && (
        <foreignObject
          width={24}
          height={24}
          x={(sourceX + targetX) / 2 - 12}
          y={(sourceY + targetY) / 2 - 12}
          requiredExtensions="http://www.w3.org/1999/xhtml"
          style={{ pointerEvents: 'all' }}
        >
          <div
            className="w-full h-full flex items-center justify-center rounded-full bg-white border border-red-500 hover:bg-red-50 transition-colors duration-200 shadow-sm"
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
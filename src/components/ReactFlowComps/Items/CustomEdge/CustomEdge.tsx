import React, { useCallback, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  type EdgeProps,
  getBezierPath,
} from 'reactflow';
import { FaCut } from 'react-icons/fa';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const { setEdges } = useReactFlow();
  const [hovered, setHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Function to delete the edge
  const onEdgeClick = useCallback(() => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  }, [id, setEdges]);

  // Event handlers for hover state
  const onMouseEnter = () => setHovered(true);
  const onMouseLeave = () => setHovered(false);

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* Render the edge using BaseEdge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      {/* Conditionally render the cut icon when hovered */}
      {hovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              className="edgebutton flex items-center justify-center"
              onClick={onEdgeClick}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <FaCut size={12} className="text-red-500" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
};

export default CustomEdge;

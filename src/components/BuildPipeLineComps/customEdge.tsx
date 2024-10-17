import React, { useState } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { FaCut } from 'react-icons/fa'; // Scissor icon
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const CustomEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }) => {
    // Get the path for the edge (bezier curve)
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const [hovered, setHovered] = useState(false);  // Track hover state
    const { isRun } = useSelector((state: RootState) => state.buildPipeLineApi);

    const handleDeleteEdge = () => {
        if (data.onDeleteEdge) {
            data.onDeleteEdge(id);  // Call the function to remove the edge
        }
    };

    return (
        <>
            {/* Draw the path */}
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                style={{ stroke: '#000', strokeWidth: 2 }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={handleDeleteEdge}
            />

            {/* Position the icon at the midpoint of the edge */}
            <foreignObject
                width={40}
                height={30}
                x={labelX - 20}  // Centering the icon horizontally
                y={labelY - 15}  // Centering the icon vertically
                className="overflow-visible pointer-events-none"  // Keep pointer events for underlying line
            >
                {/* Scissor Icon on Hover */}
                {hovered && (
                    <div
                        className="flex justify-center items-center cursor-pointer pointer-events-all absolute top-1 left-3.75"
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    >
                        <FaCut size={12} className='text-red-500' />
                    </div>
                )}
            </foreignObject>
        </>
    );
};

export default CustomEdge;
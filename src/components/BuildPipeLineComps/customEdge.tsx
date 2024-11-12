import React, { useState } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { FaCut } from 'react-icons/fa'; // Scissor icon
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Stack } from '@mui/material';
import PipeLinePopUp from './pipeLinePopUp';

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
    const [open, setOpen] = React.useState(false);
    const handleDeleteEdge = () => {
        if (data.onDeleteEdge) {
            data.onDeleteEdge(id);  // Call the function to remove the edge
        }
    };
    const handleClickOpen = () => {
        setOpen(!open);
    };


    return (
        <>
            {/* Draw the path */}
            <path
                id={id}
                className="react-flow__edge-path "
                d={edgePath}
                style={{ stroke: '#000', strokeWidth: 1,padding:2 }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={handleDeleteEdge}
            />

            {/* Position the icon at the midpoint of the edge */}
            <foreignObject
                width={40}
                height={30}
                x={labelX }  // Centering the icon horizontally
                y={labelY - 15}  // Centering the icon vertically
                className="overflow-visible pointer-events-none"  // Keep pointer events for underlying line
            >
                {/* Scissor Icon on Hover */}
                {hovered && (
                    <div
                        className="flex justify-center items-center cursor-pointer pointer-events-all absolute top-1.5 left-3.75"
                        style={{ width: '0.6rem', height: '1.25rem' }}
                    >
                        <FaCut size={12} className='text-red-500' />
                    </div>
                )}
                {isRun&&(<Stack className='text-center' sx={{fontSize:'6px',mx:'auto'}} >{Math.floor((Math.random() * 100) + 1)} row</Stack>)}

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

    {isRun && (
        <>
            <img onClick={handleClickOpen} className='' src='/assets/buildPipeline/meter.png' alt='img' width={15} />
        </>
    )}
    </div>
            </foreignObject>
            <PipeLinePopUp open={open} handleClose={handleClickOpen} />

        </>
    );
};

export default CustomEdge;
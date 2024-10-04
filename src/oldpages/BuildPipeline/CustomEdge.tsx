import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { FaTachometerAlt } from 'react-icons/fa'; // meter icon
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import PipeLinePopUp from './meterComponents/pipeLinePopUp';
import { Stack } from '@mui/material';

const CustomEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }) => {
    // Get the path for the edge (bezier curve)
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    const { isRun } = useSelector((state: RootState) => state.buildPipeLineApi);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            {/* Draw the path */}
            <path id={id} className="react-flow__edge-path" d={edgePath} style={{ stroke: '#000', strokeWidth: 2 }} />

            {/* Position the icon at the midpoint of the edge */}
            <foreignObject
                width={40}
                height={30}
                x={labelX - 15} // Centering the icon horizontally
                y={labelY - 15} // Centering the icon vertically
                style={{ overflow: 'visible' }}
            >
                {/* Meter Icon */}
                {isRun && (<Stack className='text-center' sx={{ fontSize: '6px', mx: 'auto' }} >{Math.floor((Math.random() * 100) + 1)} row</Stack>)}

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                    {isRun && (
                        <>
                            <img onClick={handleClickOpen} className='' src='/assets/buildPipeline/meter.png' alt='img' width={15} />
                        </>
                    )}
                </div>
            </foreignObject>
            <PipeLinePopUp open={open} handleClose={handleClose} />
        </>
    );
};

export default CustomEdge;

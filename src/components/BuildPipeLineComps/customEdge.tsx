import React, { useState, useEffect } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { FaCut, FaTachometerAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Stack } from '@mui/material';
import PipeLinePopUp from './pipeLinePopUp';
import { ApiService } from '@/services/apiServices';
import { BsSpeedometer } from 'react-icons/bs';

const CustomEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const [hovered, setHovered] = useState(false);
    const { isRun, isDebug,nodesList, tranformationCount } = useSelector((state: RootState) => state.buildPipeLineApi);
    const nodes = JSON.parse(nodesList);
    const [open, setOpen] = React.useState(false);
    const [rowCount, setRowCount] = useState<number | null>(null);
    const [transformData, setTransformData] = useState<any>();

    const fetchRowCount = async () => {
        if (data?.params?.source) {
            const source = nodes.find((node: any) => node.id === data.params.source)?.data?.display;
            if (source) {
                const count = tranformationCount?.transformationOutputCounts?.find(
                    (count: any) => count.transformationName === source
                )?.rowCount;
                console.log("Fetched count:", count);
                setRowCount(count ?? 0); 
            }
        }
    };


    useEffect(() => {
        console.log("isRun:", isRun, "data.params:", data.params);
        fetchRowCount();
    }, [isRun, data.params,tranformationCount?.transformationOutputCounts?.length>0 ])
    // useEffect(() => {
    //     console.log("Row count updated in state:", rowCount);
    //     console.log("RtranformationCount:", tranformationCount);
    // }, [tranformationCount?.transformationOutputCounts?.length>0]);


    const handleDeleteEdge = () => {
        if (data.onDeleteEdge) {
            data.onDeleteEdge(id);
        }
    };

    const handleClickOpen = async (e: any) => {
        e.stopPropagation();
        console.log(data.params.source);
        const source = nodes.find((node: any) => node.id === data.params.source)?.data?.display;
        console.log(source);
        if (source) {
            const transformationName = tranformationCount?.transformationOutputCounts?.find(
                (count: any) => count?.transformationName === source
            )?.transformationName;
            console.log(transformationName);
            let params = {
                pipeline_name: 'sample',
                transformation_name: transformationName,
                page: 1,
                page_size: 50,
                sort_columns: 'id',
            };
            const response = await ApiService('8011', 'get', `/pipeline/debug/get_transformation_output`, null, params);
console.log(response)
            if (response?.outputs) {
                setTransformData(response?.outputs[0]?.rows);
                console.log(response)
                setOpen(!open);
            }
        }
    };

    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                style={{ stroke: '#000', strokeWidth: 1, padding: 2 }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={handleDeleteEdge}
            />

            <foreignObject
                width={40}
                height={30}
                x={labelX-25}
                y={labelY - 15}
                className="overflow-visible"
            >
                {hovered && (
                    <div
                        className="flex justify-center items-center cursor-pointer absolute"
                        style={{ width: '0.6rem', height: '1.25rem' }}
                    >
                        <FaCut size={12} className='text-red-500' />
                    </div>
                )}

                {isDebug && (
                    <Stack className="text-center" sx={{ fontSize: '6px', mx: 'auto' }}>
                        {rowCount !== null ? `${rowCount} row${rowCount !== 1 ? 's' : ''}` : "Loading..."}
                    </Stack>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {isDebug && (
                        <div onClick={handleClickOpen} style={{ cursor: 'pointer' }}>
                            {/* <img src='/assets/buildPipeline/meter.png' alt='img' width={15} /> */}
                            <BsSpeedometer className='text-slate-700' size={12}/>
                        </div>
                    )}
                </div>
            </foreignObject>
            <PipeLinePopUp open={open} handleClose={handleClickOpen} transformData={transformData} />
        </>
    );
};

export default CustomEdge;

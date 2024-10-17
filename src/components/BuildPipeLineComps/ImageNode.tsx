import React, { useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import { setIsHover, setSelectedOption } from "../../redux/BuildPipeLineSlice";
import { RootState } from "@/store/store";
import { Input, TextField } from "@mui/material";

export interface CustomNodeData {
    image?: {
        url: string;
        alt: string;
    };
    label?: string;
    display?: string;
    isShow?: boolean;
    isEdit?: boolean;
    onDelete?: () => void;
    onClone?: (nodeData: CustomNodeData) => void;
    onEdit?: (nodeData: CustomNodeData) => void;
    dataList?: any
}

export const ImageNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }: any) => {
    const dispatch = useDispatch();
    const [display, setDisplay] = useState(data.display)
    async function handlePop(data: any) {
        console.log(data)
        await dispatch(setSelectedOption(data));
        dispatch(setIsHover(true));
    }

    function handleDelete() {
        if (data.onDelete) {
            data.onDelete();
        } else {
            alert("Delete function not provided");
        }
    }

    function handleClone() {
        if (data.onClone) {
            data.onClone(data);
        } else {
            alert("Clone function not provided");
        }
    }
    function handleEdit() {
        console.log(data)
        data.display = display;
        if (data.onEdit) {
            data.isEdit = false;
            data.onEdit(data);
        } else {
            alert("Edit function not provided");
        }
    }

    return (
        <div style={{ textAlign: 'center', border: 'none', padding: '8px', position: 'relative' }}>
            {/* Invisible target handle */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                style={{ opacity: 0.05, width: '5px', height: '5px', left: '5px', top: '35%', transform: 'translateY(-50%)' }} // Invisible but expanded hit area
            // style={{ visibility: 'hidden' }}
            />
            {/* Display image */}
            {data.image && <img src={data.image.url} alt={data.image.alt} width={50} style={{ maxWidth: '80px', maxHeight: '80px' }} />}
            {/* Invisible source handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="a"
                isConnectable={isConnectable}
                style={{ opacity: 0.05, width: '5px', height: '5px', right: '5px', top: '35%', transform: 'translateY(-50%)' }} // Invisible but expanded hit area

            // style={{ visibility: 'hidden' }}
            />
            {/* Conditional rendering of control icons */}
            {data.isShow && (
                <div
                    style={{
                        position: 'absolute',
                        top: -10,
                        left: 0,
                        cursor: 'pointer',
                        color: '#000',
                        fontSize: '10px',
                        background: '#fff',
                        borderRadius: '2px',
                        border: '1px solid #f2f2f2',
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                    }}
                >
                    <img style={{ margin: '1px' }} src="/assets/buildPipeline/copy.png" alt="Copy" width={10} height={10} onClick={handleClone} />
                    <img style={{ margin: '1px' }} src="/assets/buildPipeline/trash.png" alt="Delete" width={10} height={10} onClick={handleDelete} />
                    <img style={{ margin: '1px' }} src="/assets/buildPipeline/info-circle.png" alt="Info" width={10} height={10} />
                    <img style={{ margin: '1px' }} src="/assets/buildPipeline/edit-2.png" alt="Edit" width={10} height={10} onClick={() => data.isEdit = true} />
                </div>
            )}
            {/* Display node data */}
            <div >
                {data.label && (
                    <div onClick={() => handlePop(data)} style={{
                        marginTop: '8px',
                        fontSize: '7px',
                        color: '#333',
                        fontWeight: 'bold',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}>
                        {data.label}
                    </div>
                )}
                {(data.display && !data.isEdit) && (
                    <div style={{
                        fontSize: '7px',
                        color: '#333',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}>
                        {data.display}
                    </div>
                )}
                {(data.display && data.isEdit) && (
                    <div className="w-12">
                        <input
                            type="text"
                            value={display}
                            className="w-12 h-4 border rounded-sm px-2 text-xs focus:border-blue-500 focus:outline-none"
                            style={{ paddingTop: '-2px', paddingBottom: '-10px', margin: 0, fontSize: '7px' }}
                            onChange={(event: any) => setDisplay(event.target.value)}
                            onBlur={() => handleEdit()} // Call handleEdit when input loses focus
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

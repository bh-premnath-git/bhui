import React from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useDispatch } from "react-redux";
import { setIsHover, setSelectedOption } from "../../redux/BuildPipeLineSlice";

export interface CustomNodeData {
    image?: {
        url: string;
        alt: string;
    };
    label?: string;
    display?: string;
    isShow?: boolean;
    onDelete?: () => void;
    onClone?: (nodeData: CustomNodeData) => void;
}

export const ImageNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }: any) => {
    const dispatch = useDispatch();

    function handlePop(data: any) {
        dispatch(setSelectedOption(data.label));
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

    return (
        <div style={{ textAlign: 'center', border: 'none', padding: '8px', position: 'relative' }}>
            {/* Invisible target handle */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                style={{ opacity: 0.1, width: '5px', height: '5px', left: '0px', top: '35%', transform: 'translateY(-50%)' }} // Invisible but expanded hit area
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
                style={{ opacity: 0.1, width: '5px', height: '5px', right: '0px', top: '35%', transform: 'translateY(-50%)' }} // Invisible but expanded hit area

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
                    <img style={{ margin: '1px' }} src="/assets/buildPipeline/edit-2.png" alt="Edit" width={10} height={10} />
                </div>
            )}
            {/* Display node data */}
            <div onClick={() => handlePop(data)}>
                {data.label && (
                    <div style={{
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
                {data.display && (
                    <div style={{
                        fontSize: '7px',
                        color: '#333',
                        fontWeight: 'bold',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}>
                        {data.display}
                    </div>
                )}
            </div>
        </div>
    );
};

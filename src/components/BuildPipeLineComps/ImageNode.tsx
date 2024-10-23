import React, { useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useDispatch } from "react-redux";
import { setIsHover, setSelectedOption } from "../../redux/BuildPipeLineSlice";

export interface CustomNodeData {
    image: {
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
    dataList?: any;
}


export const ImageNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }: any) => {
    const dispatch = useDispatch();
    const [display, setDisplay] = useState(data.display);

    function handlePop(data: any) {
        dispatch(setSelectedOption({ display: data.display, label: data.label }));
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
        data.display = display;
        if (data.onEdit) {
            data.isEdit = false;
            data.onEdit(data);
        } else {
            alert("Edit function not provided");
        }
    }

    return (
        <div style={{ 
            textAlign: 'center', 
            border: 'none', 
            padding: '8px', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            {/* Target Handle */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                style={{ opacity: 0.05, width: '5px', height: '5px', left: '8px', top: '33%', transform: 'translateY(-50%)' }} 
            />
            
            {/* Display image */}
            {data.image && <img src={data.image.url} alt={data.image.alt} width={50} style={{ maxWidth: '80px', maxHeight: '80px' }} />}

            {/* Source Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="a"
                isConnectable={isConnectable}
                style={{ opacity: 0.05, width: '5px', height: '5px', right: '8px', top: '33%', transform: 'translateY(-50%)' }} 
            />

{data.isShow && (
    <div
        style={{
            position: 'absolute',
            top: -10,
            left: '40%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            color: '#000',
            fontSize: '8px',
            background: '#fff',
            borderRadius: '2px',
            // border: '1px solid #f2f2f2',
            display: 'flex',
            gap: '4px', // Space between buttons
            alignItems: 'center',
        }}
    >
        <img src="/assets/buildPipeline/copy.svg" alt="Copy" width={10} height={10} onClick={handleClone} />
        <img src="/assets/buildPipeline/trash.svg" alt="Delete" width={10} height={10} onClick={handleDelete} />
        <img src="/assets/buildPipeline/info-circle.svg" alt="Info" width={10} height={10} />
        <img src="/assets/buildPipeline/edit-2.svg" alt="Edit" width={10} height={10} onClick={() => data.isEdit = true} />
    </div>
)}


            {/* Display node data */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {data.label && (
                    <div 
                        onClick={() => handlePop(data)} 
                        style={{
                            marginTop: '8px',
                            fontSize: '9px',
                            color: '#333',
                            fontWeight: 'bold',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            textAlign: 'center'
                        }}
                    >
                        {data.label}
                    </div>
                )}
                {(data.display && !data.isEdit) && (
                    <div style={{
                        fontSize: '8px',
                        color: '#333',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textAlign:'center',
                        width: '100%'
                    }}>
                        {data.display}
                    </div>
                )}
                {(data.display && data.isEdit) && (
                    <div className="w-12">
                        <input
                            type="text"
                            value={display}
                            className="w-12 h-4 border rounded-sm px-2 text-xs text-center focus:border-blue-500 focus:outline-none"
                            style={{ paddingTop: '-2px', paddingBottom: '-10px', margin: 0, fontSize: '7px' }}
                            onChange={(event: any) => setDisplay(event.target.value)}
                            onBlur={() => handleEdit()}
                            autoFocus
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

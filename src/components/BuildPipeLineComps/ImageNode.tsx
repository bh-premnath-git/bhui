import React, { useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import { setIsHover, setSelectedOption } from "../../redux/BuildPipeLineSlice";
import { RootState } from "@/store/store";
import { PiFlagPennantFill } from "react-icons/pi";
import { BsAppIndicator } from "react-icons/bs";
import { GoDotFill } from "react-icons/go"; 
import { LuMilestone } from "react-icons/lu";

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
    handleCheck?: (nodeData: CustomNodeData) => void;
    onEdit?: (nodeData: CustomNodeData) => void;
    dataList?: any;
}


export const ImageNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }: any) => {
    const dispatch = useDispatch();
    const [display, setDisplay] = useState(data.display);
    const { isDebug,isRun }: any = useSelector((state: RootState) => state.buildPipeLineApi);

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
    function handleCheck() {
        if (data.handleCheck) {
            console.log(data)
            data.isCheck = !data.isCheck;
            data.handleCheck(data);
        } else {
            alert("Check function not provided");
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
                style={{ opacity: 0.05, width: '5px', height: '5px', left: '2px', top: '33%'}} 
            />
            
            {/* Display image */}
            {data.image && <img src={data.image.url} alt={data.image.alt} width={40} style={{ maxWidth: '80px', maxHeight: '80px' }} />}
            {isRun&&(<LuMilestone  className={`absolute right-0 top-0 cursor-pointer ${!data.isCheck?'text-red-500':'text-green-500'}`} size={10} onClick={handleCheck} />)}
            {/* Source Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="a"
                isConnectable={isConnectable}
                style={{ opacity: 0.05, width: '5px', height: '5px', right: '2px', top: '33%'}} 
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
        {/* {isDebug&&(<img src="/assets/buildPipeline/GoMilestone.svg" alt="Edit" width={10} height={10} onClick={() => data.isEdit = true} />)} */}
    </div>
)}


            {/* Display node data */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {data.label && (
                    <div 
                        onClick={() => handlePop(data)} 
                        style={{
                            marginTop: '6px',
                            fontSize: '9px',
                            color: '#333',
                            fontWeight: 'bold',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            textAlign: 'center',
                            fontFamily: 'Inter'
                        }}
                    >
                        {data.label}
                    </div>
                )}
                {(data.display && !data.isEdit) && (
                    <div className="w-12" style={{
                        fontSize: '7px',
                        color: '#333',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textAlign:'center',
                        fontFamily: 'Inter'

                    }}>
                        {data.display}
                    </div>
                )}
                {(data.display && data.isEdit) && (
                    <div className="w-14">
                        <input 
                            type="text"
                            value={display}
                            className="flex h-4 w-full border border-input bg-transparent px-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ paddingTop: '-2px', paddingBottom: '-10px', margin: 0, fontSize: '7px', fontFamily: 'Inter',borderRadius: '3px' }}
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

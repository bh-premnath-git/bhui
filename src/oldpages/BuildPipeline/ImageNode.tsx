import { useDispatch } from "react-redux";
import { Handle, NodeProps, Position } from "reactflow";
import { setIsHover, setSelectedOption } from "../../redux/BuildPipeLineSlice";
import { GoCopy, GoTrash } from "react-icons/go";
import { FiAlertCircle, FiEdit3 } from "react-icons/fi";
import { IconButton } from "@mui/material";

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
    dataList?:any;
}

export const ImageNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }: any) => {
    const dispatch = useDispatch();

    function handlePop(data:any) {
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
        <div style={{ textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', position: 'relative' }}>
            <Handle
                type="target"
                position={Position.Left}
                onConnect={(params) => console.log("handle onConnect", params)}
                isConnectable={isConnectable}
            />
            {data.image && <img src={data.image.url} alt={data.image.alt} width={50} style={{ maxWidth: '80px', maxHeight: '80px' }} />}
            <Handle
                type="source"
                position={Position.Right}
                id="a"
                isConnectable={isConnectable}
            />
            {data.isShow && (
                <div
                    style={{
                        position: 'absolute',
                        top: -10,
                        left: 0,
                        // padding: '2px', 
                        cursor: 'pointer',
                        color: '#000',
                        fontSize: '10px',
                        background: '#fff',
                        borderRadius: '2px',
                        border: '1px solid #f2f2f2',
                        display: 'flex',
                        gap: '4px',
                        alignContent:'center',
                        alignItems:'center'
                    }}
                >
                    <img style={{margin:'1px'}} src="/assets/buildPipeline/copy.png" alt="" width={10} height={10} onClick={handleClone}/>
                    <img style={{margin:'1px'}} src="/assets/buildPipeline/trash.png" alt="" width={10} height={10} onClick={handleDelete}/>
                    <img style={{margin:'1px'}} src="/assets/buildPipeline/info-circle.png" alt="" width={10} height={10} />
                    <img style={{margin:'1px'}} src="/assets/buildPipeline/edit-2.png" alt="" width={10} height={10} />
                   

                </div>
            )}
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

import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, { useNodesState, useEdgesState, addEdge, Controls, Connection, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import ExpandableButton from '../../common/ExpandableButton';
import { buildData } from './staticData';
import TransformPopUp from "./components/popups/TransformPopUp";
import Footer from "./components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import OrderPopUp from "./components/popups/orderPopUp";
import { CustomNodeData, ImageNode } from "./ImageNode";
import FilterPopUp from "./components/popups/FilterPopUp";
import { CiPlay1 } from "react-icons/ci";
import { Alert, IconButton, Popover, Snackbar, Tooltip } from "@mui/material";
import { CiPause1 } from "react-icons/ci";
import PlayPopUp from "./components/popups/PlayPopUp";
import Codepage from "./components/CodePage";
import CloseIcon from '@mui/icons-material/Close';
import { setIsHover, setIsRun } from "../../Redux/BuildPipeLineSlice";
import CustomEdge from "./CustomEdge";
import BuildPipePopup from "./components/popups/BuildPipePopup";
import ControlPanel from "./ControlPanel";

type CustomNode = Node<CustomNodeData>;

const connectionLineStyle = { stroke: "gray" };
const snapGrid: [number, number] = [15, 15];
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const nodeTypes: any = {
    imageNode: ImageNode,
};
const edgeTypes = {
    custom: CustomEdge,
};
export default function BuildDataPipeLine() {
    const data = buildData;
    const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const [nodeIdCounter, setNodeIdCounter] = useState<number>(5);
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const [selectedNodeData, setSelectedNodeData] = useState<CustomNodeData | null>(null);
    const { isHover, selectedOption }: any = useSelector((state: RootState) => state.buildPipeLineApi);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    // const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);
    const dispatch = useDispatch();
    const isToggled = useSelector((state: RootState) => state.toggle.isToggled);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    useEffect(() => {
        setNodes([]);
        setEdges([
            {
                id: "e2a-3",
                source: "2",
                target: "3",
                sourceHandle: "a",
                animated: true,
                style: { stroke: "#000" },
            },
            {
                id: "e2b-4",
                source: "2",
                target: "4",
                sourceHandle: "b",
                animated: true,
                style: { stroke: "#000" },
            },
        ]);
    }, [setEdges, setNodes]);

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds) =>
                addEdge({ ...params, animated: true, type: 'custom', 
                    style: { stroke: '#000' } }, eds) 
            ),
        [setEdges]
    );

    const addNode = (lead: string, title: string, index: number) => {
        const newNodeId = `${nodeIdCounter}`;
        setNodeIdCounter((prevId) => prevId + 1);

        const newNode: CustomNode = {
            id: newNodeId,
            type: "imageNode",
            data: {
                image: {
                    url: `${lead}`,
                    alt: `New Node ${newNodeId}`,
                },
                label: `${title} `,
                display: `${title} ${index + 1}`,
                isShow: false,
                onDelete: () => handleDelete(newNodeId),
                onClone: () => cloneNode(newNode),
            },
            position: { x: Math.random() * 200, y: Math.random() * 200 },
        };

        setNodes((nds): any => [...nds, newNode]);
    };

    const handleDelete = (nodeId: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    };

    const cloneNode = (dataNode: CustomNode) => {
        setNodeIdCounter((prevId) => {
            const newNodeId = `${prevId}`;
            const newNode: CustomNode = {
                id: newNodeId,
                type: "imageNode",
                data: {
                    ...dataNode.data,
                    onDelete: () => handleDelete(newNodeId),
                    onClone: () => cloneNode(newNode),
                },
                position: { x: Math.random() * 200, y: Math.random() * 200 },
            };

            setNodes((nds): any => [...nds, newNode]);
            return prevId + 1;
        });
    };

    const onNodeClick = (event: React.MouseEvent, node: CustomNode) => {
        const updatedNode = { ...node, data: { ...node.data, isShow: true } };
        setNodes((nds): any => nds.map((n) => (n.id === node.id ? updatedNode : n)));
        setSelectedNodeData(updatedNode.data);
        setTimeout(() => {
            const revertedNode = { ...updatedNode, data: { ...updatedNode.data, isShow: false } };
            setNodes((nds): any => nds.map((n) => (n.id === node.id ? revertedNode : n)));
            setSelectedNodeData(revertedNode.data);
        }, 2000);
    };

   
    const handleClose1 = () => {
        setOpen1(false);
    };

    const handleButtonClick = () => {
        dispatch(setIsRun(true))
        setIsButtonClicked(true);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setIsButtonClicked(false);
        dispatch(setIsHover(false))
    };
   
    const handleOverlayOpen = () => {
        setIsOverlayOpen(true);
    };
    const handleOverlayClose = () => {
        // alert()
        setIsOverlayOpen(false);
    };



    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            {isToggled ? (
                <Codepage />
            ) : (
                <>
                    <div className='d-flex justify-content-center myFont'>
                        {data.map(item => (
                            <div key={item.id}>
                                <ExpandableButton
                                    addNode={addNode}
                                    icon={item.icon}
                                    text={item?.text}
                                    className={item.className}
                                    style={{ margin: '10px' }}
                                    title={item.title}
                                    dataSet={item.dataSet}
                                    // lead={item.lead}
                                    // line={item.line}
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{ height: 'calc(100% - 60px)' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            connectionLineStyle={connectionLineStyle}
                            snapToGrid={true}
                            snapGrid={snapGrid}
                            edgeTypes={edgeTypes}  // Register custom edge types here

                            defaultViewport={defaultViewport}
                            fitView
                            onNodeClick={onNodeClick}
                        >
                            <Controls />
                        </ReactFlow>
                    </div>

                    

                    {selectedOption.toLowerCase().trim() === "transform" &&
                        <TransformPopUp isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }

                    {selectedOption.toLowerCase().trim() === "filter" &&
                        <FilterPopUp isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }
                    {selectedOption.toLowerCase().trim() === "order" &&
                        <OrderPopUp isOpen={isHover} onClose={closePopup} nodeData={selectedNodeData} />
                    }
                </>
            )}
            <Footer com={<ControlPanel
                        isButtonClicked={isButtonClicked}
                        handleButtonClick={handleButtonClick}
                        isPopupOpen={isPopupOpen}
                        closePopup={closePopup}
                        open1={open1}
                        handleClose1={handleClose1}
                        handleClose1Icon={handleClose1}
                    />}/>
            <div style={{
                position: 'fixed',
                top: '120px', // Adjust as needed to be above the footer
                right: '1%',
                zIndex: 1
            }}>
                <Tooltip title="" placement="top">
                    <IconButton
                        style={{
                            border: '1px solid gray',
                            borderRadius: '50%',
                            backgroundColor: 'blue',
                            color: 'white',
                            width: '50px',
                            height: '50px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={handleOverlayOpen}
                    >
                        <img src="/assets/buildPipeline/bighammer.png" alt="bighammer" width={60} />
                    </IconButton>
                </Tooltip>
            </div>
            {isOverlayOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: '400px',
                        height: '100%',
                        backgroundColor: 'white',
                        zIndex: 2,
                        color: 'black',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'start',
                        alignItems: 'center',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
                    }}
                >

                    <BuildPipePopup closePopup={handleOverlayClose} />
                </div>

            )}
        </div>
    );
}

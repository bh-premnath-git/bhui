// import React, { useCallback, useEffect, useState } from 'react';
// import ReactFlow, { addEdge, Connection, Controls, Edge, Node, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from 'reactflow';
// import ExpandableButton from '@/common/ExpandableButton';
// import buildFlow from "@/pages/buildPipeLine/build_pipe_line_flow.json";
// import { CustomNodeData, ImageNode } from '@/components/BuildPipeLineComps/CustomNode';
// import CustomEdge from '@/components/BuildPipeLineComps/customEdge';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '@/store/store';
// import { LocalStorageService } from '@/services/localStorageServices';
// import { isEmpty } from '@/Utils/isObjectEmpty';
// import { useNavigate } from 'react-router-dom';
// import "reactflow/dist/style.css";
// import styles from '@/pages/buildPipeLine/BuildPipeLine.module.css';
// import { getTransformationCount, setBuildPipeLineNodes } from '@/redux/BuildPipeLineSlice';
// import Footer from '@/components/BuildPipeLineComps/Footer';
// import useToast from '@/oldcomponents/teast-service';
// import { Divider } from '@mui/material';

// type CustomNode = Node<CustomNodeData>;

// const connectionLineStyle = { stroke: "gray" };
// const snapGrid: [number, number] = [15, 15];
// // const defaultViewport = { x: -100, y: 0, zoom: 0.5 };
// const proOptions = { hideAttribution: true };

// const nodeTypes: any = {
//     imageNode: ImageNode,
// };
// const edgeTypes = {
//     custom: CustomEdge,
// };
// interface editPipeLine {
//     pipeline?: any
// }
// function BuildPipeLineFlow({ pipeline }: editPipeLine) {
//     const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
//     const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

//     const [nodeIdCounter, setNodeIdCounter] = useState<number>(5);
//     const { createPipeLineDtl } = useSelector((state: RootState) => state.buildPipeLineApi);
//     const [pipeLineList, setPipeLineList] = useState(LocalStorageService.getItem('pipeLineList') || []);
//     const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();

//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [ToastComponent, showToast] = useToast();

//     useEffect(() => {
//         console.log(createPipeLineDtl)
//         console.log(pipeline)
//         console.log(pipeLineList)
//         if (pipeline?.pipeline_id) {
//             const existPipeLine = pipeLineList.find((pipeLine: any) => pipeLine.pipeline_id == pipeline.pipeline_id);
//             if (existPipeLine) {
//                 setNodes(existPipeLine?.nodes);
//                 setEdges(existPipeLine?.edges);
//             }
//         } else {
//             if (!isEmpty(createPipeLineDtl)) {
//                 const idExist = pipeLineList.find((pipeLine: any) => pipeLine.pipeline_id === createPipeLineDtl.pipeline_id);
//                 if (!idExist) {
//                     const newPipeLineList = [...pipeLineList, { pipeline_id: createPipeLineDtl.pipeline_id }];
//                     setPipeLineList(newPipeLineList); // Update state with the new array
//                     LocalStorageService.setItem('pipeLineList', newPipeLineList)
//                     // console.log(newPipeLineList); // Log the new array
//                 } else {
//                     console.log(idExist)
//                 }
//             }
//         }

//     }, [createPipeLineDtl]);

//     useEffect(() => {
//         // setNodes([]);
//         // setEdges([])
//         // console.log(nodes)
//         dispatch(setBuildPipeLineNodes(JSON.stringify(nodes)));

//     }, [nodes]);

//     const addNode = (lead: string, title: string, name: string, dataList?: any) => {
//         const newNodeId = `${nodeIdCounter}`;
//         setNodeIdCounter((prevId) => prevId + 1);

//         const newNode: CustomNode = {
//             id: newNodeId,
//             type: "imageNode",
//             data: {
//                 image: {
//                     url: `${lead}`,
//                     alt: `New Node ${newNodeId}`,
//                 },
//                 label: `${title} `,
//                 display: `${name}`,
//                 isShow: false,
//                 isEdit: false,
//                 isCheck: false,
//                 onDelete: () => handleDelete(newNodeId),
//                 onClone: () => cloneNode(newNode),
//                 handleCheck: () => handleCheck(newNode),
//                 onEdit: () => editNode(newNode),
//                 dataList: dataList,
//             } as CustomNodeData,  // Explicit cast here
//             // Starting position at the top left, with vertical spacing based on nodeIdCounter
//             position: { x: 50 + nodeIdCounter * 100, y: 50 },
//         };

//         setNodes((nds): any => [...nds, newNode]);
//     };


//     const handleDelete = (nodeId: string) => {
//         setNodes((nds) => nds.filter((node) => node.id !== nodeId));
//     };
//     const handleCheck = (node: CustomNode) => {
       
//         console.log(node)

//         const updatedNode = { ...node, data: { ...node.data, isCheck: true } };
//         setNodes((nds): any => nds.map((n) => (n.id === node.id ? updatedNode : n)));
       

//     };

//     const cloneNode = (dataNode: CustomNode) => {
//         setNodeIdCounter((prevId) => {
//             const newNodeId = `${prevId}`;
//             const newNode: CustomNode = {
//                 id: newNodeId + 1,
//                 type: "imageNode",
//                 data: {
//                     ...dataNode.data,
//                     isEdit: false,
//                 } as CustomNodeData,  // Explicit cast here
//                 position: { x: 50 + nodeIdCounter * 120, y: 50 },
//             };

//             setNodes((nds): any => [...nds, newNode]);
//             return prevId + 1;
//         });
//     };

//     const editNode = (node: CustomNode) => {
//         setNodes((nds) => {
//             const index = nds.findIndex((n) => n.id === node.id);
//             if (index !== -1) {
//                 nds[index] = {
//                     ...nds[index],
//                     data: {
//                         ...nds[index].data,
//                     },
//                 };
//             }
//             return nds;
//         });

//     };

//     const onConnect = useCallback(
//         (params: Connection) =>
//             setEdges((eds) =>
//                 addEdge(
//                     {
//                         ...params,
//                         type: 'custom',
//                         style: { stroke: 'gray', width: '1px', color: 'gray' },
//                         data: { onDeleteEdge: deleteEdge, params: params }, // Pass delete function to edge data
//                     },
//                     eds
//                 )
//             ),
//         [setEdges]
//     );

//     // Function to delete an edge
//     const deleteEdge = (edgeId: string) => {
//         setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
//     };

//     const onSave = async () => {
//         console.log(nodes)
//         // let i = pipeLineList?.findIndex((pipeLine: any) => pipeLine.pipeline_id === createPipeLineDtl.pipeline_id);
//         // console.log(i)
//         // pipeLineList[i].nodes = nodes;
//         // pipeLineList[i].edges = edges;
//         // setPipeLineList(pipeLineList);
//         // LocalStorageService.setItem('pipeLineList', pipeLineList);
//         // navigate('/designers/build-datapipeline/')
//     };

//     const onNodeClick = (event: React.MouseEvent, node: CustomNode) => {
//         const updatedNode = { ...node, data: { ...node.data, isShow: true } };
//         setNodes((nds): any => nds.map((n) => (n.id === node.id ? updatedNode : n)));
//         setTimeout(() => {
//             const revertedNode = { ...updatedNode, data: { ...updatedNode.data, isShow: false } };
//             setNodes((nds): any => nds.map((n) => (n.id === node.id ? revertedNode : n)));
//         }, 3000);
//     };
   
//     // Zoom in function
//     const handleZoomIn = useCallback(() => {
//         zoomIn();
//     }, [zoomIn]);

//     // Zoom out function
//     const handleZoomOut = useCallback(() => {
//         zoomOut();
//     }, [zoomOut]);

//     // Fit view function to reset zoom level and position
//     const handleFitView = useCallback(() => {
//         fitView({ padding: 7 });
//     }, [fitView]);
//     return (
//         <>
//             <div className="flex justify-content-center ">
//                 <div className='d-flex justify-content-center mt-8'>
//                     {buildFlow.module.map((item: any) => (
//                         <div key={item.id}>
//                             <ExpandableButton
//                                 addNode={addNode}
//                                 icon={item.icon}
//                                 text={item?.text}
//                                 title={item.title}
//                                 dataSet={item.dataSet}
//                                 expandIcon={item.expandIcon}
//                             />
//                         </div>
//                     ))}
//                 </div>
//                 <ToastComponent />

//                 {/* <div className='mt-8 ml-48'>
//                     <button onClick={onSave} className='bg-black text-white px-4 py-1 rounded-sm'>Save</button>

//                 </div> */}
//             </div>

//             <div style={{ height: '80vh', width: '200%' }} >
//                 <ReactFlow style={{ left: '-44%', width: '100%' }}
//                     nodes={nodes}
//                     edges={edges}
//                     onNodesChange={onNodesChange}
//                     onEdgesChange={onEdgesChange}
//                     onConnect={onConnect}
//                     nodeTypes={nodeTypes}
//                     connectionLineStyle={connectionLineStyle}
//                     snapToGrid
//                     snapGrid={snapGrid}
//                     edgeTypes={edgeTypes}
//                     // defaultViewport={defaultViewport}
//                     fitView
//                     onNodeClick={onNodeClick}
//                     proOptions={proOptions}

//                 >
//                     <Controls />
//                 </ReactFlow>
//                 <Divider sx={{ borderColor: '#ccc', marginTop: '-0.5%' }} className='shadow' />

//                 <div style={{ position: 'absolute', bottom: 1, right: 10, zIndex: 10 }}>
//                     <Footer
//                         handleZoomIn={handleZoomIn}
//                         handleZoomOut={handleZoomOut}
//                         handleFitView={handleFitView}
//                         showToast={showToast}
//                     />
//                 </div>
//             </div>
//         </>
//     );
// }


// export default function WrappedBuildPipeLineFlow(props: editPipeLine) {
//     return (
//         <ReactFlowProvider>
//             <BuildPipeLineFlow {...props} />
//         </ReactFlowProvider>
//     );
// }
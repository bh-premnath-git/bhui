import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { addEdge, Connection, Controls, Edge, Node, useEdgesState, useNodesState } from 'reactflow';
import ExpandableButton from '@/common/ExpandableButton';
import buildFlow from "@/pages/buildPipeLine/build_pipe_line_flow.json";
import { CustomNodeData, ImageNode } from '@/components/BuildPipeLineComps/ImageNode';
import CustomEdge from '@/components/BuildPipeLineComps/customEdge';

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

export default function BuildPipeLineFlow() {
    const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const [nodeIdCounter, setNodeIdCounter] = useState<number>(5);

    useEffect(() => {
        setNodes([]);
    }, [setEdges, setNodes]);

    const addNode = (lead: string, title: string, name: string, dataList?: any) => {
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
                display: `${name}`,
                isShow: false,
                isEdit: false,
                onDelete: () => handleDelete(newNodeId),
                onClone: () => cloneNode(newNode),
                onEdit: () => editNode(newNode),
                dataList: dataList,
            },
            position: { x: 0 + nodes.length * 100, y: -150 },
        };

        setNodes((nds): any => [...nds, newNode]);
    };

    const handleDelete = (nodeId: string) => {
        alert()
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
                    isEdit: false,
                },
                position: { x: Math.random() * 200, y: -150 },
            };

            setNodes((nds): any => [...nds, newNode]);
            return prevId + 1;
        });
    };

    const editNode = (node: CustomNode) => {
        setNodes((nds) => {
            const index = nds.findIndex((n) => n.id === node.id);
            if (index !== -1) {
                nds[index] = {
                    ...nds[index],
                    data: {
                        ...nds[index].data,
                    },
                };
            }
            return nds;
        });
    };

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        type: 'custom',
                        style: { stroke: 'gray', width: '1px', color: 'gray' },
                        data: { onDeleteEdge: deleteEdge }, // Pass delete function to edge data
                    },
                    eds
                )
            ),
        [setEdges]
    );

    // Function to delete an edge
    const deleteEdge = (edgeId: string) => {
        setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    };

    const onNodeClick = (event: React.MouseEvent, node: CustomNode) => {
        const updatedNode = { ...node, data: { ...node.data, isShow: true } };
        setNodes((nds): any => nds.map((n) => (n.id === node.id ? updatedNode : n)));
        setTimeout(() => {
            const revertedNode = { ...updatedNode, data: { ...updatedNode.data, isShow: false } };
            setNodes((nds): any => nds.map((n) => (n.id === node.id ? revertedNode : n)));
        }, 3000);
    };

    return (
        <>
            <div className='d-flex justify-content-center mt-8'>
                {buildFlow.module.map((item: any) => (
                    <div key={item.id}>
                        <ExpandableButton
                            addNode={addNode}
                            icon={item.icon}
                            text={item?.text}
                            title={item.title}
                            dataSet={item.dataSet}
                            expandIcon={item.expandIcon}
                        />
                    </div>
                ))}
            </div>

            <div style={{ height: 'calc(100% - 100px)' }}>
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
                    edgeTypes={edgeTypes}
                    defaultViewport={defaultViewport}
                    fitView
                    onNodeClick={onNodeClick}
                >
                    <Controls />
                </ReactFlow>
            </div>
        </>
    );
}

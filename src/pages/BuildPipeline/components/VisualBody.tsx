import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Controls, Background, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import '../../../styles/indexx.css';
import VisualSideBar from './VisualSideBar';
import VisualResizebleNode from '../../portal/VisualResizebleNode';

// Define the type for reactFlowInstance
type ReactFlowInstanceType = {
    screenToFlowPosition: (coords: { x: number; y: number; }) => { x: number; y: number; };
    // Add other methods or properties if needed
};

const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: 'input node' },
        position: { x: 250, y: 5 },
    },
];

const nodeTypes = {
    VisualResizebleNode
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstanceType | null>(null);

    const onConnect = useCallback(
        (params: any) => setEdges((eds: any) => addEdge(params, eds)),
        [],
    );

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: any) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance?.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            if (!position) {
                return;
            }

            const newNode = {
                id: getId(),
                type: 'VisualResizebleNode',
                position,
                data: { label: `${type} ` },
                style: { background: '#fff', border: '1px solid black', borderRadius: 2, fontSize: 12 }
            };

            setNodes((nds: any) => nds.concat(newNode));
        },
        [reactFlowInstance],
    );

    return (
        <div className="dndflow" style={{ width: '100%', height: '600px' }}>
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper} >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                        nodeTypes={nodeTypes}
                    >
                        <Controls />
                        <Background color="#fff" variant={BackgroundVariant.Lines} />
                    </ReactFlow>
                </div>
                <VisualSideBar  />
            </ReactFlowProvider>
        </div>
    );
};

export default DnDFlow;

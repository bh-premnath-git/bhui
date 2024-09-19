import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Connection,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './Items/CustomNode/CustomNode';
import CustomEdge from './Items/CustomEdge/CustomEdge';
import Toolbar from './Items/Toolbar/Toolbar';
import styles from './FlowPlayground.module.css';
import { NodeType } from './types';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const FlowPlayground: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddNode = useCallback(
    (nodeType: NodeType, selectedNodeName: string) => {
      const position = {
        x: Math.random() * 250,
        y: Math.random() * 250,
      };
      const selectedNode = nodeType.nodes.find(node => node.node_name === selectedNodeName);
      const newNode: Node = {
        id: `${nodeType.type}-${Date.now()}`,
        type: 'custom',
        position,
        data: { 
          label: nodeType.label, 
          type: nodeType.type, 
          icon: nodeType.icon, 
          nodes: nodeType.nodes, 
          color: nodeType.color, 
          selectedNode: selectedNode || null,
          onDelete: onDeleteNode, // Pass the delete function to the node
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const reactFlowComponent = useMemo(() => (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    >
      <Controls />
    </ReactFlow>
  ), [nodes, edges, onNodesChange, onEdgesChange, onConnect]);

  return (
    <div className={styles.flowPlayground}>
      <Toolbar onAddNode={onAddNode} />
      <ReactFlowProvider>
        <div className={styles.flowContainer}>
          {reactFlowComponent}
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowPlayground;

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

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // Added onCloneNode function
  const onCloneNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const nodeToClone = nds.find((node) => node.id === nodeId);
        if (nodeToClone) {
          const newNode: Node = {
            ...nodeToClone,
            id: `${nodeToClone.id}-${Date.now()}`,
            position: {
              x: nodeToClone.position.x + 20,
              y: nodeToClone.position.y + 20,
            },
            data: {
              ...nodeToClone.data,
              onDelete: onDeleteNode, // Ensure functions are included
              onClone: onCloneNode,
            },
          };
          return nds.concat(newNode);
        }
        return nds;
      });
    },
    [setNodes, onDeleteNode]
  );

  const onAddNode = useCallback(
    (nodeType: NodeType, selectedNodeName: string) => {
      const position = {
        x: Math.random() * 250,
        y: Math.random() * 250,
      };
      const selectedNode = nodeType.nodes.find((node) => node.node_name === selectedNodeName);
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
          onClone: onCloneNode, // Pass the clone function to the node
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, onDeleteNode, onCloneNode]
  );

  const reactFlowComponent = useMemo(
    () => (
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
    ),
    [nodes, edges, onNodesChange, onEdgesChange, onConnect]
  );

  return (
    <div className={styles.flowPlayground}>
      <Toolbar onAddNode={onAddNode} />
      <ReactFlowProvider>
        <div className={styles.flowContainer}>{reactFlowComponent}</div>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowPlayground;

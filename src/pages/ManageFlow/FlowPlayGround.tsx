import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useReactFlow, Panel } from 'reactflow';
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';

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


const CustomControls = () => {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleFitView = () => {
    fitView();
  };

  const handleResetView = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  return (
    <Panel position="bottom-center">
      <div className={styles.controlsContainer}>
       
        <button
          onClick={handleFitView}
          className={styles.controlButton}
        >
          <Maximize size={20} />
        </button>
        <button
          onClick={handleResetView}
          className={styles.controlButton}
        >
          <Minimize size={20} />
        </button>
        <button
          onClick={handleZoomIn}
          className={styles.controlButton}
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className={styles.controlButton}
        >
          <ZoomOut size={20} />
        </button>
      </div>
    </Panel>
  );
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
              x: nodeToClone.position.x + 150,
              y: nodeToClone.position.y + 150,
            },
            data: {
              ...nodeToClone.data,
              onDelete: onDeleteNode,
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
          onDelete: onDeleteNode,
          onClone: onCloneNode,
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
        <CustomControls />
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

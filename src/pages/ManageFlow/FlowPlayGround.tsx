import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ZoomIn, ZoomOut, Minimize } from 'lucide-react';

import CustomNode from './Items/CustomNode/CustomNode';
import CustomEdge from './Items/CustomEdge/CustomEdge';
import Toolbar from './Items/Toolbar/Toolbar';
import styles from './FlowPlayground.module.css';
import { NodeType } from './types';
import DataPreviewModal from './DataPreviewModal/DataPreviewModal';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const proOptions = { hideAttribution: true };

const CustomControls = () => {
  const { zoomIn, zoomOut, setViewport } = useReactFlow();
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleResetView = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  const toggleDataPreview = () => {
    setIsDataPreviewOpen(!isDataPreviewOpen);
  };

  return (
    <Panel position="bottom-center" className={styles.customControlsPanel}>
      <div className={styles.controlsContainer}>
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
        <button
          onClick={toggleDataPreview}
          className={styles.dataPreviewButton}
          title="Toggle Data Preview"
        >
          <span className={styles.dataPreviewText}>Data Preview</span>
          <span className={`${styles.dataPreviewSymbol} ${isDataPreviewOpen ? styles.inverted : ''}`}>
            ^
          </span>
        </button>
      </div>
      <DataPreviewModal isOpen={isDataPreviewOpen} onClose={() => setIsDataPreviewOpen(false)} />
    </Panel>
  );
};

const FlowPlayground: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const logCurrentState = useCallback(() => {
    console.log('Current Nodes:', nodes);
    console.log('Current Edges:', edges);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        setTimeout(() => logCurrentState(), 0);
        return newEdges;
      });
    },
    [setEdges, logCurrentState]
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const newNodes = nds.filter((node) => node.id !== nodeId);
        setTimeout(() => logCurrentState(), 0);
        return newNodes;
      });
      setEdges((eds) => {
        const newEdges = eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
        setTimeout(() => logCurrentState(), 0);
        return newEdges;
      });
    },
    [setNodes, setEdges, logCurrentState]
  );

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
          const newNodes = nds.concat(newNode);
          setTimeout(() => logCurrentState(), 0);
          return newNodes;
        }
        return nds;
      });
    },
    [setNodes, onDeleteNode, logCurrentState]
  );

  const onAddNode = useCallback(
    (nodeType: NodeType, selectedNodeName: string) => {
      const position = {
        x: Math.random() * 200,
        y: Math.random() * 200,
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

      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        setTimeout(() => logCurrentState(), 0);
        return newNodes;
      });
    },
    [setNodes, onDeleteNode, onCloneNode, logCurrentState]
  );

  const wrappedOnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setTimeout(() => logCurrentState(), 300);
    },
    [onNodesChange, logCurrentState]
  );

  const wrappedOnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setTimeout(() => logCurrentState(), 3000);
    },
    [onEdgesChange, logCurrentState]
  );

  const reactFlowComponent = useMemo(
    () => (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        proOptions={proOptions}
        onNodesChange={wrappedOnNodesChange}
        onEdgesChange={wrappedOnEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <CustomControls />
      </ReactFlow>
    ),
    [nodes, edges, wrappedOnNodesChange, wrappedOnEdgesChange, onConnect]
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
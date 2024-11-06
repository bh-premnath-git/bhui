import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  useReactFlow,
  EdgeChange,
  NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ZoomIn, ZoomOut, Minimize } from 'lucide-react';
import { useSelector } from 'react-redux';

import CustomNode from '@/components/ReactFlowComps/Items/CustomNode/CustomNode';
import CustomEdge from '@/components/ReactFlowComps/Items/CustomEdge/CustomEdge';
import Toolbar from '@/components/ReactFlowComps/Items/Toolbar/Toolbar';
import styles from '@/pages/manageFlow/FlowPlayground.module.css';
import { NodeType } from '@/pages/manageFlow/types';
import DataPreviewModal from '@/components/ReactFlowComps/DataPreviewModal/DataPreviewModal';
import { RootState } from '@/store/store';
import { LocalStorageService } from '@/services/localStorageServices';
import { databaseSyncService } from '@/services/databaseSync';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };
const proOptions = { hideAttribution: true };
const defaultViewport = { x: -100, y: 0, zoom: 1.5 };
const snapGrid: [number, number] = [20, 20];

const CustomControls = () => {
  const { zoomIn, zoomOut, setViewport } = useReactFlow();
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);

  const handleZoomIn = () => zoomIn();
  const handleZoomOut = () => zoomOut();
  const handleResetView = () => setViewport({ x: 0, y: 0, zoom: 1 });
  const toggleDataPreview = () => setIsDataPreviewOpen(!isDataPreviewOpen);

  return (
    <div className={styles.customControlsPanel}>
      <div className={styles.controlsContainer}>
        <button onClick={handleResetView} className={styles.controlButton}>
          <Minimize size={20} />
        </button>
        <button onClick={handleZoomIn} className={styles.controlButton}>
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} className={styles.controlButton}>
          <ZoomOut size={20} />
        </button>
        <button
          onClick={toggleDataPreview}
          className={styles.dataPreviewButton}
          title="Toggle Data Preview"
        >
          <span className={styles.dataPreviewText}>Data Preview</span>
          <span
            className={`${styles.dataPreviewSymbol} ${isDataPreviewOpen ? styles.inverted : ''
              }`}
          >
            ^
          </span>
        </button>
      </div>
      <DataPreviewModal
        isOpen={isDataPreviewOpen}
        onClose={() => setIsDataPreviewOpen(false)}
      />
    </div>
  );
};

const FlowPlayground: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { selectedFlowFromList } = useSelector((state: RootState) => state.flowApi);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const onCloneNode = useCallback((nodeId: string) => {
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
        return [...nds, newNode];
      }
      return nds;
    });
  }, [setNodes, onDeleteNode]);

  databaseSyncService.initialize(10000);

  useEffect(() => {
    return () => {
      databaseSyncService.destroy();
    };
  }, []);

  useEffect(() => {
    if (selectedFlowFromList?.flow_id) {
      const storedFlowData = LocalStorageService.getItem(selectedFlowFromList.flow_id);
      if (storedFlowData) {
        try {
          const { nodes: storedNodes, edges: storedEdges } = storedFlowData;
          setNodes(storedNodes.map((node: Node) => ({
            ...node,
            data: { ...node.data, onDelete: onDeleteNode, onClone: onCloneNode },
          })));
          setEdges(storedEdges);
        } catch (error) {
          console.error('Error parsing stored flow data:', error);
        }
      } else {
        setNodes([]);
        setEdges([]);
      }
    }
  }, [selectedFlowFromList, onDeleteNode, onCloneNode, setNodes, setEdges]);


  const logCurrentState = useCallback(() => {
    if (selectedFlowFromList?.flow_id) {
      LocalStorageService.setItem(selectedFlowFromList.flow_id, { nodes, edges });
    } else {
      console.error('No flow_id available to save the flow data');
    }
  }, [nodes, edges, selectedFlowFromList]);

  const onConnect = useCallback((params: Connection) =>
    setEdges((eds) => {
      const newEdge = { ...params, type: 'custom' };
      const newEdges = addEdge(newEdge, eds);
      setTimeout(logCurrentState, 0);
      return newEdges;
    })
    , [setEdges, logCurrentState]);

  const onAddNode = useCallback((nodeType: NodeType, selectedNodeName: string) => {
    const selectedNode = nodeType.nodes.find((node) => node.node_name === selectedNodeName);
    const newNode: Node = {
      id: `${nodeType.type}-${Date.now()}`,
      type: 'custom',
      position: { x: 100 + nodes.length * 100, y: 150 },
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
    setNodes((nds) => [...nds, newNode]);
    setTimeout(logCurrentState, 0);
  }, [setNodes, onDeleteNode, onCloneNode, logCurrentState]);

  const wrappedOnNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    setTimeout(logCurrentState, 300);
  }, [onNodesChange, logCurrentState]);

  const wrappedOnEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    setTimeout(logCurrentState, 300);
  }, [onEdgesChange, logCurrentState]);

  const checkNodeProximityAndConnect = useCallback(() => {
    const HANDLE_WIDTH = 10;
    const HANDLE_HEIGHT = 24;
    const NODE_WIDTH = 100;
    const NODE_HEIGHT = 130;
    const HANDLE_OFFSET_X = 8;

    const handles = nodes.flatMap((node) => [
      {
        nodeId: node.id,
        handleId: 'left',
        type: 'target',
        x: node.position.x - HANDLE_WIDTH + HANDLE_OFFSET_X,
        y: node.position.y + NODE_HEIGHT / 2 - HANDLE_HEIGHT / 2,
        width: HANDLE_WIDTH,
        height: HANDLE_HEIGHT,
      },
      {
        nodeId: node.id,
        handleId: 'right',
        type: 'source',
        x: node.position.x + NODE_WIDTH - HANDLE_OFFSET_X,
        y: node.position.y + NODE_HEIGHT / 2 - HANDLE_HEIGHT / 2,
        width: HANDLE_WIDTH,
        height: HANDLE_HEIGHT,
      },
    ]);

    const newEdges = handles.flatMap((handleA, i) =>
      handles.slice(i + 1).flatMap((handleB) => {
        if (
          handleA.type !== handleB.type &&
          handleA.nodeId !== handleB.nodeId &&
          rectanglesOverlap(handleA, handleB)
        ) {
          const [sourceHandle, targetHandle] = handleA.type === 'source' ? [handleA, handleB] : [handleB, handleA];
          if (!edges.some((edge) => edge.source === sourceHandle.nodeId && edge.target === targetHandle.nodeId)) {
            return [{
              id: `e${sourceHandle.nodeId}-${targetHandle.nodeId}`,
              source: sourceHandle.nodeId,
              target: targetHandle.nodeId,
              type: 'custom', // Add this line
              animated: true,
              style: { stroke: '#888' },
            }];
          }
        }
        return [];
      })
    );

    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }
  }, [nodes, edges, setEdges]);

  const reactFlowComponent = useMemo(() => {
    const getNewNodePosition = () => {
      if (!reactFlowWrapper.current) return { x: 0, y: 0 };
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      return { x: rect.width, y: rect.height / 2 - 30 };
    };

    const nodesWithUpdatedPositions = nodes.map((node) =>
      node.position.x === 0 && node.position.y === 0
        ? { ...node, position: getNewNodePosition() }
        : node
    );

    return (
      <ReactFlow
        nodes={nodesWithUpdatedPositions}
        edges={edges}
        defaultEdgeOptions={{ type: 'custom' }}
        proOptions={proOptions}
        onNodesChange={wrappedOnNodesChange}
        onEdgesChange={wrappedOnEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={checkNodeProximityAndConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={true}
        snapGrid={snapGrid}
        defaultViewport={defaultViewport}
      >
        <CustomControls />
      </ReactFlow>
    );
  }, [nodes, edges, wrappedOnNodesChange, wrappedOnEdgesChange, onConnect, checkNodeProximityAndConnect]);

  return (
    <div className={styles.flowPlayground}>
      <Toolbar onAddNode={onAddNode} />
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} className={styles.flowContainer}>
          {reactFlowComponent}
        </div>
      </ReactFlowProvider>
    </div>
  );
};

const rectanglesOverlap = (rect1: any, rect2: any) => !(
  rect1.x + rect1.width < rect2.x ||
  rect1.x > rect2.x + rect2.width ||
  rect1.y + rect1.height < rect2.y ||
  rect1.y > rect2.y + rect2.height
);

export default FlowPlayground;
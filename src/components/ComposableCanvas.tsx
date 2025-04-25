// src/components/designers/ComposableCanvas.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  ConnectionMode,
  Connection,
  addEdge,
  ReactFlowInstance,
  MarkerType,
  getOutgoers,
  useReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlow } from '@/context/designers/FlowContext';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

export type CanvasType = 'flow' | 'pipeline';

interface ComposableCanvasProps {
  type: CanvasType;
  nodeTypes: Record<string, React.ComponentType<any>>;
  edgeTypes: Record<string, React.ComponentType<any>>;
  controls?: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  children?: React.ReactNode;
  className?: string;
  canvasClassName?: string;
  enablePanOnScroll?: boolean;
  enableSelectionOnDrag?: boolean;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  defaultViewport?: { x: number; y: number; zoom: number };
  minZoom?: number;
  maxZoom?: number;
  showBackground?: boolean;
  backgroundVariant?: BackgroundVariant;
  renderControls?: boolean;
}

const defaultSnapGrid: [number, number] = [15, 15];
const defaultViewport = { x: 0, y: 0, zoom: 1 };

/**
 * ComposableCanvas - A unified canvas component that works with both Flow and DataPipeline contexts
 * 
 * This component preserves all functionality from both canvas types while providing
 * a consistent interface.
 */
export const ComposableCanvas = ({
  type,
  nodeTypes,
  edgeTypes,
  controls,
  loading = false,
  error = false,
  errorTitle = 'Error loading canvas',
  errorDescription = 'Please try again later',
  children,
  className = 'w-full h-full bg-background',
  canvasClassName = 'bg-background',
  enablePanOnScroll = true,
  enableSelectionOnDrag = true,
  snapToGrid = true,
  snapGrid = defaultSnapGrid,
  defaultViewport: customDefaultViewport,
  minZoom = 0.3,
  maxZoom = 2,
  showBackground = false,
  backgroundVariant = BackgroundVariant.Dots,
  renderControls = true,
}: ComposableCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  // Get context-specific data and functions
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  let onNodesChange: ((changes: NodeChange[]) => void) | undefined = undefined;
  let onEdgesChange: ((changes: EdgeChange[]) => void) | undefined = undefined;
  let onConnect: ((connection: Connection) => void) | undefined = undefined;
  let setReactFlowInstance: ((instance: ReactFlowInstance) => void) | undefined = undefined;
  let fitView: (() => void) | undefined = undefined;
  let checkNodeProximityAndConnect: (() => void) | undefined = undefined;
  let isValidConnection: ((connection: Connection) => boolean) | undefined = undefined;
  let handleKeyDown: ((event: KeyboardEvent) => void) | undefined = undefined;
  
  // Flow context specific functionality
  if (type === 'flow') {
    const flowContext = useFlow();
    if (flowContext) {
      nodes = flowContext.nodes;
      edges = flowContext.edges;
      onNodesChange = flowContext.onNodesChange;
      onEdgesChange = flowContext.onEdgesChange;
      setReactFlowInstance = flowContext.setReactFlowInstance;
      // Use either context's fitView or the ReactFlow instance's fitView
      fitView = flowContext.fitView || (() => reactFlowInstance.fitView());
      
      // Flow-specific connection handler
      onConnect = useCallback(
        (connection: Connection) => {
          const edge = {
            ...connection,
            type: 'custom',
            markerStart: {
              type: MarkerType.ArrowClosed,
              width: 34,
              height: 20,
              color: '#94a3b8',
              orient: 'auto-start',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 34,
              height: 20,
              color: '#94a3b8',
              orient: 'auto-start',
            },
          };
          flowContext.setEdges((eds) => addEdge(edge, eds));
        },
        [flowContext.setEdges]
      );
      
      // Flow-specific proximity detection
      checkNodeProximityAndConnect = useCallback(() => {
        const HANDLE_WIDTH = 12;
        const HANDLE_HEIGHT = 32;
        const NODE_WIDTH = 56;
        const NODE_HEIGHT = 56;
        const HANDLE_OFFSET_X = 0;
     
        const handles = flowContext.nodes.flatMap((node) => [
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
              if (!flowContext.edges.some((edge) => edge.source === sourceHandle.nodeId && edge.target === targetHandle.nodeId)) {
                return [{
                  id: `e${sourceHandle.nodeId}-${targetHandle.nodeId}`,
                  source: sourceHandle.nodeId,
                  target: targetHandle.nodeId,
                  type: 'custom',
                  style: { stroke: '#888' },
                  markerStart: {
                    type: MarkerType.ArrowClosed,
                    width: 34,
                    height: 20,
                    color: '#94a3b8',
                    orient: 'auto-start',
                  },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 34,
                    height: 20,
                    color: '#94a3b8',
                    orient: 'auto-start',
                  },
                }];
              }
            }
            return [];
          })
        );
     
        if (newEdges.length > 0) {
          flowContext.setEdges((eds) => [...eds, ...newEdges]);
        }
      }, [flowContext.nodes, flowContext.edges, flowContext.setEdges]);
      
      // Flow-specific connection validation
      isValidConnection = useCallback(
        (connection: Connection) => {
          const target = flowContext.nodes.find((node) => node.id === connection.target);
          if (!target) return false;
          
          const hasCycle = (node: any, visited = new Set()) => {
            if (visited.has(node.id)) return false;
            visited.add(node.id);
            for (const outgoer of getOutgoers(node, flowContext.nodes, flowContext.edges)) {
              if (outgoer.id === connection.source) return true;
              if (hasCycle(outgoer, visited)) return true;
            }
            return false;
          };
          
          if (target.id === connection.source) return false;
          return !hasCycle(target);
        },
        [flowContext.nodes, flowContext.edges],
      );
    }
  } 
  // Pipeline context specific functionality
  else if (type === 'pipeline') {
    const pipelineContext = usePipelineContext();
    if (pipelineContext) {
      nodes = pipelineContext.nodes;
      edges = pipelineContext.edges;
      onNodesChange = pipelineContext.handleNodesChange;
      onEdgesChange = pipelineContext.handleEdgesChange;
      onConnect = pipelineContext.onConnect;
      handleKeyDown = pipelineContext.handleKeyDown;
      // Use ReactFlow instance's fitView for pipeline type if needed
      fitView = () => reactFlowInstance.fitView();
    }
  }
  
  // Initialize ReactFlow instance
  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      if (type === 'flow' && setReactFlowInstance) {
        setReactFlowInstance(instance);
        // Delay to ensure all components are mounted
        if (nodes?.length > 0 && fitView) {
          const timer = setTimeout(() => {
            fitView();
          }, 300);
          return () => clearTimeout(timer);
        }
      }
    },
    [type, setReactFlowInstance, nodes, fitView]
  );
  
  // Helper function for node proximity detection
  const rectanglesOverlap = (rect1: any, rect2: any) => !(
    rect1.x + rect1.width < rect2.x ||
    rect1.x > rect2.x + rect2.width ||
    rect1.y + rect1.height < rect2.y ||
    rect1.y > rect2.y + rect2.height
  );
  
  // Add keyboard event listeners for pipeline canvas
  useEffect(() => {
    if (type === 'pipeline' && handleKeyDown) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [type, handleKeyDown, nodes]);
  
  // Only run fitView when we have nodes that need positioning for flow canvas
  useEffect(() => {
    if (type === 'flow' && nodes?.length > 0 && fitView) {
      // Add a small delay to ensure nodes are rendered
      const timer = setTimeout(() => {
        fitView();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [type, nodes, fitView]);
  
  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-background relative flex items-center justify-center">
        <LoadingState className="w-40 h-40" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return <ErrorState title={errorTitle} description={errorDescription} />;
  }
  
  // Determine the appropriate default viewport
  const effectiveDefaultViewport = customDefaultViewport || defaultViewport;
  
  return (
    <div className={className}>
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            onNodeDragStop={type === 'flow' ? checkNodeProximityAndConnect : undefined}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            proOptions={{ hideAttribution: true }}
            isValidConnection={isValidConnection}
            className={canvasClassName}
            defaultEdgeOptions={{
              type: 'custom',
            }}
            connectionMode={ConnectionMode.Loose}
            panOnScroll={!!enablePanOnScroll}
            selectionOnDrag={enableSelectionOnDrag}
            defaultViewport={effectiveDefaultViewport}
            minZoom={minZoom}
            maxZoom={maxZoom}
            panOnDrag={true}
            zoomOnScroll={true}
            nodesDraggable={true}
            nodesConnectable={true}
            snapToGrid={snapToGrid}
            snapGrid={snapGrid}
            fitView={false}
            fitViewOptions={{ padding: 0.3 }}
          >
            {showBackground && <Background variant={backgroundVariant} gap={12} size={1} />}
            {renderControls && !controls && <Controls />}
            {controls}
            {children}
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

// Standalone wrapper component that includes ReactFlowProvider
export const ComposableCanvasWrapper = (props: ComposableCanvasProps) => {
  return (
    <ReactFlowProvider>
      <ComposableCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default ComposableCanvasWrapper;
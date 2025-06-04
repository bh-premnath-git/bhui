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
import { useSidebar } from '@/context/SidebarContext';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { cn } from '@/lib/utils';

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

// Simple debounce utility function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), waitFor);
  };
}

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
  
  // Get contexts
  const flowContext = useFlow();
  const pipelineContext = usePipelineContext();
  const { isRightAsideOpen } = useSidebar(); // Get sidebar context to check if right aside is open

  // State for nodes/edges/handlers, default to undefined
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  let onNodesChange: ((changes: NodeChange[]) => void) | undefined = undefined;
  let onEdgesChange: ((changes: EdgeChange[]) => void) | undefined = undefined;
  let onConnect: ((connection: Connection) => void) | undefined = undefined;
  let setReactFlowInstance: ((instance: ReactFlowInstance) => void) | undefined = undefined;
  let checkNodeProximityAndConnect: (() => void) | undefined = undefined;
  let isValidConnection: ((connection: Connection) => boolean) | undefined = undefined;
  let handleKeyDown: ((event: KeyboardEvent) => void) | undefined = undefined;

  // Memoize fitView function (ensure this exists and is correct)
  const fitView = useCallback(() => {
    if (type === 'flow' && flowContext?.fitView) {
      // console.log('Using flowContext.fitView');
      flowContext.fitView();
    } else if (reactFlowInstance) {
      // console.log('Using reactFlowInstance.fitView');
      reactFlowInstance.fitView();
    } else {
      // console.log('fitView: No instance or context method available');
    }
  }, [type, flowContext, reactFlowInstance]);

  // Assign context values based on type
  if (type === 'flow' && flowContext) {
    nodes = flowContext.nodes;
    edges = flowContext.edges;
    onNodesChange = flowContext.onNodesChange;
    onEdgesChange = flowContext.onEdgesChange;
    setReactFlowInstance = flowContext.setReactFlowInstance;
    
    // Restore original useCallback for onConnect
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

    // Restore original useCallback for checkNodeProximityAndConnect
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

    // Restore original useCallback for isValidConnection
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

  } else if (type === 'pipeline' && pipelineContext) {
    nodes = pipelineContext.nodes;
    edges = pipelineContext.edges;
    onNodesChange = pipelineContext.handleNodesChange;
    onEdgesChange = pipelineContext.handleEdgesChange;
    onConnect = pipelineContext.onConnect;
    handleKeyDown = pipelineContext.handleKeyDown;
  }
  
  // Initialize ReactFlow instance
  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      // Store the instance for both flow and pipeline types
      if (type === 'flow' && setReactFlowInstance) {
        setReactFlowInstance(instance);
      }
      
      // For both flow and pipeline types, fit view after a delay
      if (nodes?.length > 0 && fitView) {
        const timer = setTimeout(() => {
          try {
            // Use the instance directly for fitView to ensure it works
            instance.fitView({ duration: 800, padding: 0.1 });
          } catch (error) {
            console.error('FitView error:', error);
          }
        }, 300);
        return () => clearTimeout(timer);
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
  
  // *** Use ResizeObserver to trigger fitView ***
  useEffect(() => {
    // Debounce the fitView call to avoid rapid firing during resize/transitions
    const debouncedFitView = debounce(fitView, 350); // Adjust debounce delay if needed

    let observer: ResizeObserver;
    const element = reactFlowWrapper.current;

    if (element && fitView) {
      observer = new ResizeObserver(() => {
        // console.log('ResizeObserver triggered: Calling debounced fitView');
        debouncedFitView();
      });

      observer.observe(element);
    }

    // Cleanup function
    return () => {
      if (observer && element) {
        // console.log('ResizeObserver cleanup: Unobserving element');
        observer.unobserve(element);
      }
      // Also clear any pending debounced call
      debouncedFitView(); // Call with no args potentially, or manage clearing timeout directly if debounce allows
    };
  }, [fitView]); // Depend only on the fitView function (which depends on context/instance)
  
  // Add effect to handle right aside panel visibility changes
  useEffect(() => {
    // If the right aside panel is opened/closed, we need to make sure ReactFlow is properly resized
    if (reactFlowInstance) {
      // First resize event to help ReactFlow detect the layout change
      const timer1 = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
      
      // Second resize event with first fitView attempt
      const timer2 = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        try {
          reactFlowInstance.fitView({ duration: 300, padding: 0.2 });
        } catch (error) {
          console.error('Error fitting view in first attempt:', error);
        }
      }, 300);
      
      // Third resize with second fitView attempt after layout should be settled
      const timer3 = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        try {
          reactFlowInstance.fitView({ duration: 300, padding: 0.2 });
        } catch (error) {
          console.error('Error fitting view in second attempt:', error);
        }
      }, 600);
      
      // Final attempt after everything has fully rendered
      const timer4 = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        try {
          reactFlowInstance.fitView({ duration: 300, padding: 0.2 });
        } catch (error) {
          console.error('Error fitting view in final attempt:', error);
        }
      }, 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isRightAsideOpen, reactFlowInstance]);
  
  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-background relative flex items-center justify-center">
        <LoadingState fullScreen={true} className="w-40 h-40" />
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
    <div className={cn(
      className, 
      'relative reactflow-container',
      isRightAsideOpen ? 'canvas-with-aside' : ''
    )}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        zIndex: 5
      }}
    >
      <ReactFlowProvider>
        <div 
          ref={reactFlowWrapper} 
          className={cn(
            "absolute inset-0 reactflow-wrapper",
            isRightAsideOpen ? 'pr-0 transition-all duration-300' : ''
          )}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 10
          }}
        >
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
            fitView={true}
            fitViewOptions={{ padding: 0.3, duration: 800 }}
          >
            {showBackground && <Background variant={backgroundVariant} gap={12} size={1} />}
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
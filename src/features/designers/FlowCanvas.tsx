import { useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Connection,
  addEdge,
  ReactFlowInstance,
  MarkerType,
  getOutgoers,
} from '@xyflow/react';
import { useAppDispatch } from '@/hooks/useRedux';
import { useFlow } from '@/context/designers/FlowContext';
import { useFlow as useFlowApi } from '@/features/designers/flow/hooks/useFlow';
import { CustomControls } from '@/components/bh-reactflow-comps/flow/flow/CustomControls';
import { nodeTypes } from '@/components/bh-reactflow-comps/flow/nodeTypes';
import { edgeTypes } from '@/components/bh-reactflow-comps/flow/edgeTypes';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import 'reactflow/dist/style.css';
import { setSelectedEnv, setSelectedFlow } from '@/store/slices/designer/flowSlice';
 
const proOptions = { hideAttribution: true };
const snapGrid: [number, number] = [15, 15];
const defaultViewport = { x: 0, y: 0, zoom: 1.8 };
 
const isValidFlowId = (flowId: string | null | undefined): flowId is string => {
  return typeof flowId === 'string' && flowId.trim().length > 0;
};

export const FlowCanvas = () => {
  const { id } = useParams();
  const { useFetchFlowById } = useFlowApi();
  
  // Only fetch flow if we have a valid ID
  const shouldFetchFlow = isValidFlowId(id);
  const { data: flow, isLoading, isError } = useFetchFlowById(id, shouldFetchFlow);
  const dispatch = useAppDispatch();
 
  const {
    nodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    setReactFlowInstance,
    fitView,
  } = useFlow();
 
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
 
  const onConnect = useCallback(
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
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );
 
  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
      // Delay to ensure all components are mounted
      if (nodes.length > 0) {
        const timer = setTimeout(() => {
          fitView();
        }, 300);
        return () => clearTimeout(timer);
      }
    },
    [setReactFlowInstance, fitView, nodes.length]
  );
 
  const checkNodeProximityAndConnect = useCallback(() => {
    const HANDLE_WIDTH = 12;
    const HANDLE_HEIGHT = 32;
    const NODE_WIDTH = 56;
    const NODE_HEIGHT = 56;
    const HANDLE_OFFSET_X = 0;
 
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
      setEdges((eds) => [...eds, ...newEdges]);
    }
 
  }, [nodes, edges, setEdges]);
 
  const isValidConnection = useCallback(
    (connection: any) => {
      const target = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node: any, visited = new Set()) => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);
        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };
      if (target.id === connection.source) return false;
      return !hasCycle(target);
    },
    [nodes, edges],
  );
 
  // Only run fitView when we have nodes that need positioning
  useEffect(() => {
    if (nodes.length > 0 && fitView) {
      // Add a small delay to ensure nodes are rendered
      const timer = setTimeout(() => {
        fitView();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, fitView]);
 
  useEffect(() => {
    if (flow && isValidFlowId(id)) {
      dispatch(setSelectedFlow(flow));
      const flowdeployment = flow;
      if (flowdeployment.flow_deployment?.[0]?.bh_env_id) {
        dispatch(setSelectedEnv(Number(flowdeployment.flow_deployment[0].bh_env_id)));
      }
    } else if (id && !isValidFlowId(id)) {
      console.warn('FlowCanvas: Invalid flow ID provided, skipping flow setup', { id });
    }
  }, [flow, dispatch, id]);
 
  if (isLoading) {
    return (
      <div className="w-full h-full bg-background relative flex items-center justify-center">
        <LoadingState className='w-40 h-40' fullScreen={true} />
      </div>
    );
  }
 
  if (isError) {
    return <ErrorState title="Error loading flow" description="Please try again later" />;
  }

  // Handle invalid flow ID case
  if (id && !isValidFlowId(id)) {
    return <ErrorState title="Invalid Flow ID" description="The provided flow ID is not valid. Please check the URL and try again." />;
  }

  // Handle case where no flow ID is provided
  if (!id) {
    return <ErrorState title="No Flow Selected" description="Please select a flow to view." />;
  }
 
  return (
    <div className="w-full h-full bg-background overflow-hidden">
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            onNodeDragStop={checkNodeProximityAndConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            proOptions={proOptions}
            isValidConnection={isValidConnection}
            className="bg-background"
            defaultEdgeOptions={{
              type: 'custom',
            }}
            panOnScroll
            selectionOnDrag
            defaultViewport={defaultViewport}
            minZoom={0.3}
            maxZoom={2}
            panOnDrag={true}
            zoomOnScroll={true}
            nodesDraggable
            nodesConnectable
            snapToGrid={true}
            snapGrid={snapGrid}
            fitView={false}
            fitViewOptions={{ padding: 0.3 }}
          >
            <CustomControls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
 
const rectanglesOverlap = (rect1: any, rect2: any) => !(
  rect1.x + rect1.width < rect2.x ||
  rect1.x > rect2.x + rect2.width ||
  rect1.y + rect1.height < rect2.y ||
  rect1.y > rect2.y + rect2.height
);
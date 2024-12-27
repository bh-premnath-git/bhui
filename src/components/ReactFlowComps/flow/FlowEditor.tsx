import { useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Panel,
  Connection,
  addEdge,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  getOutgoers,
  getNodesBounds,
} from 'reactflow';
import { useFlow } from '@/contexts/FlowContext';
import { ToolbarNodes } from '@/components/ReactFlowComps/flow/toolbar/ToolbarNodes';
import { CustomControls } from '@/components/ReactFlowComps/flow/flow/CustomControls';
import { nodeTypes } from '@/lib/nodeTypes';
import { edgeTypes } from '@/lib/edgeTypes';
import 'reactflow/dist/style.css';

const proOptions = { hideAttribution: true };
const snapGrid: [number, number] = [15, 15];
const defaultViewport = { x: -180, y: 0, zoom: 1.5 };

export function FlowEditor() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setReactFlowInstance,
  } = useFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getViewport } = useReactFlow();

  // Improved viewport check function
  const checkAndFitView = useCallback(() => {
    if (!reactFlowWrapper.current || nodes.length === 0) return;

    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    const bounds = getNodesBounds(nodes);
    const viewport = getViewport();

    // Calculate visible area boundaries
    const visibleLeft = viewport.x;
    const visibleRight = viewport.x + (width / viewport.zoom);
    const visibleTop = viewport.y;
    const visibleBottom = viewport.y + (height / viewport.zoom);

    // Check if any node is outside the visible area
    const nodesOutOfView = nodes.some(node => {
      const nodeRight = node.position.x + (node.width || 0);
      const nodeBottom = node.position.y + (node.height || 0);

      return (
        node.position.x < visibleLeft ||
        nodeRight > visibleRight ||
        node.position.y < visibleTop ||
        nodeBottom > visibleBottom
      );
    });

    if (nodesOutOfView) {
      fitView({
        padding: 0.2,
        duration: 800,
        maxZoom: 1.5,
        minZoom: 0.5,
      });
    }
  }, [nodes, fitView, getViewport]);


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
      setEdges((eds) => {
        const newEdges = addEdge(edge, eds);
        return newEdges;
      });
    },
    [setEdges]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        return newEdges;
      });
    },
    [setEdges]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
        return newNodes;
      });

      // Add small delay before checking viewport after node changes
      setTimeout(checkAndFitView, 50);
    },
    [setNodes, checkAndFitView]
  );

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 0 });
      }, 100);
    },
    [setReactFlowInstance, fitView]
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
            }];
          }
        }
        return [];
      })
    );

    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }

    // Check viewport after connecting nodes with a small delay
    setTimeout(checkAndFitView, 50);
  }, [nodes, edges, setEdges, checkAndFitView]);

  const isValidConnection = useCallback(
    (connection) => {
      const target = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node, visited = new Set()) => {
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

  return (
    <div className="w-full h-full bg-background relative">
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
            panOnDrag={true}
            zoomOnScroll={false}
            nodesDraggable
            nodesConnectable
            snapToGrid={true}
            snapGrid={snapGrid}
          >
            <Panel position="top-center" className="w-full z-40">
              <ToolbarNodes />
            </Panel>
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
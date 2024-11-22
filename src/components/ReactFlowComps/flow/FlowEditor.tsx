import { useCallback, useRef } from 'react';
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
} from 'reactflow';
import { useFlow } from '@/contexts/FlowContext';
import { ToolbarNodes } from '@/components/ReactFlowComps/flow/toolbar/ToolbarNodes';
import { CustomControls } from '@/components/ReactFlowComps/flow/flow/CustomControls';
import { nodeTypes } from '@/lib/nodeTypes';
import { edgeTypes } from '@/lib/edgeTypes';
import 'reactflow/dist/style.css';

const proOptions = { hideAttribution: true };
const snapGrid: [number, number] = [15, 15];
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

export function FlowEditor() {
  const { 
    nodes, 
    edges, 
    setNodes, 
    setEdges,
    setReactFlowInstance,
  } = useFlow();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#94a3b8',
        },
        animated: true,
      };
      setEdges((eds) => {
        const newEdges = addEdge(edge, eds);
       
        return newEdges;
      });
    },
    [setEdges, nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
       
        return newEdges;
      });
    },
    [setEdges, nodes]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
       
        return newNodes;
      });
    },
    [setNodes, edges]
  );

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
    },
    [setReactFlowInstance]
  );

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
              type: 'custom',
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
            className="bg-background"
            defaultEdgeOptions={{
              type: 'custom',
              animated: true,
            }}
            panOnScroll
            selectionOnDrag
            defaultViewport={defaultViewport}
            panOnDrag={[1, 2]}
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

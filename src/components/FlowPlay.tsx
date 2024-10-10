import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  NodeProps,
  Node,
  Edge,
  OnConnect,
  NodeToolbar,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  PlusCircle,
  Workflow,
  Mail,
  AlertCircle,
  Copy,
  Info,
  Edit3,
} from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

// Node dimensions
const NODE_WIDTH = 150;
const NODE_HEIGHT = 80;

// Handle dimensions
const HANDLE_OFFSET_X = 8;
const HANDLE_WIDTH = 16;
const HANDLE_HEIGHT = 44;

// Types for node data and node types
interface NodeData {
  label: string;
}

type NodeType = 'trigger' | 'action' | 'condition';

// Types for handle and rectangle information
interface HandleInfo {
  nodeId: string;
  handleId: string;
  type: 'source' | 'target';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// BaseNode component
const BaseNode = ({
  id,
  data,
  type,
  isSelected,
  toggleToolbar,
  borderClass,
  onDoubleClick,
}: NodeProps<NodeData> & {
  isSelected: boolean;
  toggleToolbar: () => void;
  borderClass: string;
  onDoubleClick: () => void;
}) => {
  const handleClass = 'w-4 h-16 !bg-gray-400 rounded-sm';

  return (
    <div
      className={`relative bg-white p-4 rounded-lg shadow-lg border ${borderClass}`}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      onClick={toggleToolbar}
      onDoubleClick={onDoubleClick} // Prepared for future double-click functionality
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`${handleClass} left-[-8px]`}
        id="left"
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`${handleClass} right-[-8px]`}
        id="right"
      />
      <div className="font-semibold mb-2">{`${data?.label} ${id}`}</div>

      {/* NodeToolbar */}
      {isSelected && (
        <NodeToolbar position={Position.Top} isVisible>
          <div className="flex space-x-2">
            <button
              className="p-2 bg-blue-500 text-white rounded"
              onClick={() => console.log(`Copy node ${id}`)}
            >
              <Copy className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              className="p-2 bg-green-500 text-white rounded"
              onClick={() => console.log(`Info node ${id}`)}
            >
              <Info className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              className="p-2 bg-yellow-500 text-white rounded"
              onClick={() => console.log(`Edit node ${id}`)}
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </NodeToolbar>
      )}
    </div>
  );
};

// Higher-order component to create node components
const createNodeComponent = (
  Icon: React.FC<React.SVGProps<SVGSVGElement>>,
  iconClassName: string,
  borderClass: string
) => {
  return (props: NodeProps<NodeData>) => {
    const [isSelected, setIsSelected] = useState(false);

    const toggleToolbar = useCallback(() => {
      setIsSelected((prev) => !prev);
    }, []);

    // Prepare for future double-click functionality
    const onDoubleClick = useCallback(() => {
      // Future implementation here
    }, [props.id]);

    return (
      <div>
        <Icon
          className={`w-6 h-6 mb-2 ${iconClassName} mx-auto`}
          aria-hidden="true"
        />
        <BaseNode
          {...props}
          isSelected={isSelected}
          toggleToolbar={toggleToolbar}
          borderClass={borderClass}
          onDoubleClick={onDoubleClick}
        />
      </div>
    );
  };
};

// Node components with appropriate border classes
const TriggerNode = createNodeComponent(
  Workflow,
  'text-blue-500',
  'border-blue-500'
);
const ActionNode = createNodeComponent(
  Mail,
  'text-green-500',
  'border-green-500'
);
const ConditionNode = createNodeComponent(
  AlertCircle,
  'text-yellow-500',
  'border-yellow-500'
);

// Node types mapping
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
} as const;

// Initial nodes
const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'trigger',
    data: { label: 'New Document' },
    position: { x: 250, y: 5 },
  },
];

// Function to check rectangle overlap
function rectanglesOverlap(rect1: Rectangle, rect2: Rectangle) {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect1.x > rect2.x + rect2.width ||
    rect1.y + rect1.height < rect2.y ||
    rect1.y > rect2.y + rect2.height
  );
}

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(
    initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(
    null
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (params.sourceHandle && params.targetHandle) {
        setEdges((eds) =>
          addEdge(
            { ...params, animated: true, style: { stroke: '#888' } },
            eds
          )
        );
      }
    },
    [setEdges]
  );

  const checkNodeProximityAndConnect = useCallback(() => {
    const handles: HandleInfo[] = [];

    nodes.forEach((node) => {
      const leftHandle: HandleInfo = {
        nodeId: node.id,
        handleId: 'left',
        type: 'target',
        x: node.position.x - HANDLE_WIDTH + HANDLE_OFFSET_X,
        y: node.position.y + NODE_HEIGHT / 2 - HANDLE_HEIGHT / 2,
        width: HANDLE_WIDTH,
        height: HANDLE_HEIGHT,
      };
      const rightHandle: HandleInfo = {
        nodeId: node.id,
        handleId: 'right',
        type: 'source',
        x: node.position.x + NODE_WIDTH - HANDLE_OFFSET_X,
        y: node.position.y + NODE_HEIGHT / 2 - HANDLE_HEIGHT / 2,
        width: HANDLE_WIDTH,
        height: HANDLE_HEIGHT,
      };
      handles.push(leftHandle, rightHandle);
    });

    const newEdges: Edge[] = [];

    for (let i = 0; i < handles.length; i++) {
      const handleA = handles[i];
      for (let j = i + 1; j < handles.length; j++) {
        const handleB = handles[j];

        // Check that one is a source and the other is a target, and they are from different nodes
        if (
          handleA.type !== handleB.type &&
          handleA.nodeId !== handleB.nodeId &&
          rectanglesOverlap(handleA, handleB)
        ) {
          const sourceHandle =
            handleA.type === 'source' ? handleA : handleB;
          const targetHandle =
            handleA.type === 'target' ? handleA : handleB;

          // Check if edge already exists
          if (
            !edges.some(
              (edge) =>
                edge.source === sourceHandle.nodeId &&
                edge.target === targetHandle.nodeId &&
                edge.sourceHandle === sourceHandle.handleId &&
                edge.targetHandle === targetHandle.handleId
            )
          ) {
            const newEdge: Edge = {
              id: `e${sourceHandle.nodeId}-${targetHandle.nodeId}-${sourceHandle.handleId}-${targetHandle.handleId}`,
              source: sourceHandle.nodeId,
              target: targetHandle.nodeId,
              sourceHandle: sourceHandle.handleId,
              targetHandle: targetHandle.handleId,
              animated: true,
              style: { stroke: '#888' },
            };
            newEdges.push(newEdge);
          }
        }
      }
    }

    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }
  }, [nodes, edges, setEdges]);

  const onNodeDragStop = useCallback(() => {
    checkNodeProximityAndConnect();
  }, [checkNodeProximityAndConnect]);

  const addNode = useCallback(
    (type: NodeType) => {
      const newNode: Node<NodeData> = {
        id: (nodes.length + 1).toString(),
        type,
        data: { label: `New ${type} node` },
        position: {
          x: Math.random() * 300 + 50,
          y: Math.random() * 300 + 50,
        },
      };
      setNodes((nds) => nds.concat(newNode));
      checkNodeProximityAndConnect();
    },
    [nodes.length, setNodes, checkNodeProximityAndConnect]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  const updateNodeLabel = useCallback(
    (label: string) => {
      if (selectedNode) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, label } }
              : node
          )
        );
        setSelectedNode({
          ...selectedNode,
          data: { ...selectedNode.data, label },
        });
      }
    },
    [selectedNode, setNodes]
  );

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const memoizedFlow = useMemo(
    () => (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeDragStop={onNodeDragStop}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    ),
    [
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onNodeClick,
      onEdgeDoubleClick,
      onNodeDragStop,
    ]
  );

  return (
    <div className="h-screen w-full flex">
      {/* Sidebar for adding nodes */}
      <div className="w-64 bg-gray-100 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Add Node</h2>
        <button
          onClick={() => addNode('trigger')}
          className="mb-2 flex items-center justify-center bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          <PlusCircle className="w-4 h-4 mr-2" aria-hidden="true" />
          Trigger
        </button>
        <button
          onClick={() => addNode('action')}
          className="mb-2 flex items-center justify-center bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          <PlusCircle className="w-4 h-4 mr-2" aria-hidden="true" />
          Action
        </button>
        <button
          onClick={() => addNode('condition')}
          className="mb-2 flex items-center justify-center bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
        >
          <PlusCircle className="w-4 h-4 mr-2" aria-hidden="true" />
          Condition
        </button>
      </div>
      {/* Main ReactFlow component */}
      <div className="flex-1 h-full">{memoizedFlow}</div>
      {/* Sidebar for node properties */}
      {selectedNode && (
        <div className="w-64 bg-gray-100 p-4">
          <h2 className="text-lg font-semibold mb-4">Node Properties</h2>
          <p>Type: {selectedNode.type}</p>
          <div className="mt-4">
            <label
              htmlFor="nodeLabel"
              className="block text-sm font-medium text-gray-700"
            >
              Label:
            </label>
            <input
              type="text"
              id="nodeLabel"
              value={selectedNode.data?.label || ''}
              onChange={(e) => updateNodeLabel(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Error fallback component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div
      role="alert"
      className="p-4 bg-red-100 border border-red-400 text-red-700 rounded"
    >
      <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
      <pre className="text-sm overflow-auto mb-4">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
}

// Main component
export default function WorkflowAutomationComponent() {
  return (
    <ReactFlowProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Flow />
      </ErrorBoundary>
    </ReactFlowProvider>
  );
}

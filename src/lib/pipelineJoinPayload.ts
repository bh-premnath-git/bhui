import { Node, Edge } from '@xyflow/react';
import { getColumnSuggestions } from './pipelineAutoSuggestion';

interface JoinPayload {
  operation_type: string;
  thread_id: string;
  params: {
    dataset1_name: string;
    dataset1_schema: string;
    dataset2_name: string;
    dataset2_schema: string;
  };
}

interface InputPath {
  nodes: Node[];
  lastNodeId: string;
}

// Helper function to trace back through the pipeline and get all nodes in a path
const getInputPath = (nodeId: string, nodes: Node[], edges: Edge[]): InputPath => {
  const path: Node[] = [];
  let currentNodeId = nodeId;

  while (currentNodeId) {
    const node = nodes.find(n => n.id === currentNodeId);
    if (!node) break;

    path.push(node);

    // Get the incoming edge
    const incomingEdge = edges.find(e => e.target === currentNodeId);
    currentNodeId = incomingEdge?.source || '';
  }

  return {
    nodes: path.reverse(),
    lastNodeId: path[path.length - 1]?.id || ''
  };
};

// Get the display name for a path (using the last non-source node's title)
const getPathDisplayName = (path: Node[]): string => {
  for (let i = path.length - 1; i >= 0; i--) {
    const node = path[i];
    if (!node.id.startsWith('Reader_')) {
      return (node.data.title as string) || 'Unknown';
    }
  }
  return (path[0]?.data.title as string) || 'Unknown';
};

export const generateJoinPayload = async (
  joinNodeId: string,
  nodes: Node[],
  edges: Edge[]
): Promise<JoinPayload> => {
  // Get incoming edges to the join node
  const incomingEdges = edges.filter(edge => edge.target === joinNodeId);
  console.log(incomingEdges)
  if (incomingEdges.length !== 2) {
    throw new Error('Join node must have exactly 2 inputs');
  }

  // Get the paths for both inputs
  const path1 = getInputPath(incomingEdges[0].source, nodes, edges);
  const path2 = getInputPath(incomingEdges[1].source, nodes, edges);
  console.log(path1, "path1");
  console.log(path2, "path2");
  console.log(nodes, "nodes");
  console.log(edges, "edges");
  // Get columns for both paths
  const columns1 = await getColumnSuggestions(path1.lastNodeId, path1.nodes, edges);
  const columns2 = await getColumnSuggestions(path2.lastNodeId, path2.nodes, edges);
  console.log(columns1, "columns1");
  console.log(columns2, "columns2");
  // Create schema strings (assuming string type for all columns)
  const schema1 = columns1.map(col => `${col}: string`).join(', ');
  const schema2 = columns2.map(col => `${col}: string`).join(', ');

  // Generate unique thread_id using timestamp and random number
  const threadId = `join_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    operation_type: "dataset_join",
    thread_id: threadId,
    params: {
      dataset1_name: getPathDisplayName(path1.nodes),
      dataset1_schema: schema1,
      dataset2_name: getPathDisplayName(path2.nodes),
      dataset2_schema: schema2
    }
  };
};

// Example usage in CreateForm.tsx:
/*
const handleExpressionClick = useCallback(async (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => {
  if (schema?.title === 'Joiner') {
    try {
      const joinPayload = await generateJoinPayload(currentNodeId, nodes, edges);
      const response = await dispatch(generatePipelineAgent(joinPayload)).unwrap();
      // ... handle response ...
    } catch (error) {
      console.error('Error generating join condition:', error);
    }
  }
  // ... rest of the function ...
}, [schema?.title, currentNodeId, nodes, edges]);
*/ 
import { useCallback } from 'react';
import { Node } from 'reactflow';
import { CustomNodeData } from '@/types/flow';

export function useSelectionOperations(
  nodes: Node<CustomNodeData>[],
  setSelectedNode: React.Dispatch<React.SetStateAction<Node<CustomNodeData> | null>>
) {
  const selectNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      setSelectedNode(node || null);
    },
    [nodes, setSelectedNode]
  );

  const showNodeInfo = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        return node.data.meta;
      }
    },
    [nodes]
  );

  return {
    selectNode,
    showNodeInfo,
  };
}
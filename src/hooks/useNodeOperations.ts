import { useCallback, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { CustomNodeData, MetaData, NodeFormData } from '@/types/designer/flow';

export function useNodeOperations(
  nodes: Node<CustomNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<CustomNodeData>[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  setSelectedNode?: (node: Node<CustomNodeData> | null) => void,
  setNodeFormData?: React.Dispatch<React.SetStateAction<NodeFormData[]>>,
  setIsSaved?: (saved: boolean) => void
) {
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setEdges((prevEdges) =>
      prevEdges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    );
    setNodeFormData((prevFormData) =>
      prevFormData.filter((formData) => formData.nodeId !== nodeId)
    );
    // Clear selected node if it was deleted
    setSelectedNode?.(null);
    setIsSaved?.(false);
  }, [setNodes, setEdges, setSelectedNode, setIsSaved]);

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedNodeIds = selectedNodes.map((node) => node.id);

    if (selectedNodeIds.length === 0) return;

    setNodes((prevNodes) => 
      prevNodes.filter((node) => !selectedNodeIds.includes(node.id))
    );
    
    setEdges((prevEdges) =>
      prevEdges.filter(
        (edge) => 
          !selectedNodeIds.includes(edge.source) && 
          !selectedNodeIds.includes(edge.target)
      )
    );

    // Clear selected node if it was in the deleted selection
    if (selectedNodeIds.length > 0) {
      setSelectedNode?.(null);
    }
    
    setIsSaved?.(false);
  }, [nodes, setNodes, setEdges, setSelectedNode, setIsSaved]);

  // Handle delete key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if we're in an input field or textarea
      if (
        event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === 'Delete' || (event.key === 'Backspace' && event.metaKey)) {
        event.preventDefault();
        deleteSelectedNodes();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes]);

  const cloneNode = useCallback((nodeId: string) => {
    const lastNode = nodes[nodes.length - 1];

    setNodes((prevNodes) => {
      const nodeToClone = prevNodes.find((node) => node.id === nodeId);
      if (!nodeToClone) return prevNodes;

      const newNode = {
        ...nodeToClone,
        id: `${nodeId}-clone-${Date.now()}`,
        position: {
          x: (lastNode?.position?.x ?? nodeToClone.position.x) + 150,
          y: nodeToClone.position.y,
        },
        selected: false // Ensure cloned node isn't automatically selected
      };

      return [...prevNodes, newNode];
    });
    setIsSaved?.(false);
  }, [nodes, setNodes, setIsSaved]);

  const updateNodeMeta = useCallback(
    (nodeId: string, newMeta: Partial<MetaData>, newData?:any) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? {
              ...node,
              data: {
                ...node.data,
                ...(newData || {}),
                meta: {
                  ...node.data.meta,
                  ...newMeta,
                },
              },
            }
            : node
        )
      );
      setIsSaved?.(false);
    },
    [setNodes, setIsSaved]
  );

  const renameNode = useCallback((nodeId: string, newLabel: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? {
            ...node,
            data: {
              ...node.data,
              meta: {
                ...node.data.meta,
                renameType: newLabel,
              },
            },
          }
          : node
      )
    );
    setIsSaved?.(false);
  }, [setNodes, setIsSaved]);

  const updateNodeDimensions = useCallback(
    (nodeId: string, dimensions: { width: number; height: number }) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              dimensions,
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  return {
    deleteNode,
    deleteSelectedNodes,
    cloneNode,
    updateNodeMeta,
    renameNode,
    updateNodeDimensions
  };
}
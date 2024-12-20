import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Node, Edge, ReactFlowInstance } from 'reactflow';
import {
  FlowContextType,
  CustomNodeData,
  NodeFormData,
  EditingNode,
} from '@/types/flow';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useNodeOperations } from '@/hooks/useNodeOperations';
import { useFlowOperations } from '@/hooks/useFlowOperations';
import { useFormOperations } from '@/hooks/useFormOperations';

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [selectedFlowId, setSelectedFlowIdState] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeFormData, setNodeFormData] = useState<NodeFormData[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [editingNode, setEditingNode] = useState<EditingNode | null>(null);
  const [temporaryEdgeId, setTemporaryEdgeId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const {
    deleteNode,
    deleteSelectedNodes,
    cloneNode,
    updateNodeMeta,
    renameNode,
    updateNodeDimensions
  } = useNodeOperations(nodes, setNodes, setEdges, setSelectedNode, setIsSaved);

  const {
    zoomIn,
    zoomOut,
    fitView,
    saveFlow,
    loadFlow
  } = useFlowOperations(
    reactFlowInstance,
    nodes,
    edges,
    nodeFormData,
    selectedFlowId,
    setIsSaving,
    setIsSaved
  );

  const {
    updateNodeFormData,
    getNodeFormData
  } = useFormOperations(nodeFormData, setNodeFormData);

  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleDataPreview = useCallback(() => {
    setIsDataPreviewOpen((prev) => !prev);
  }, []);

  const deleteEdgeBySourceTarget = useCallback(
    (source: string, target: string) => {
      setEdges((prevEdges) =>
        prevEdges.filter(
          (edge) => !(edge.source === source && edge.target === target)
        )
      );
    },
    []
  );

  const showNodeInfo = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        // console.log("Node Info:", node.data.meta);
      }
    },
    [nodes]
  );

  const selectNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      setSelectedNode(node || null);
    },
    [nodes]
  );

  const prevNodeFn = useCallback(
    (nodeId: string): string[] | undefined => {
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      if (incomingEdges.length === 0) return undefined;
      const sourceNodeIds = incomingEdges.map((edge) => edge.source);

      const previousNodesFormData = nodeFormData.filter((formData) =>
        sourceNodeIds.includes(formData.nodeId)
      );
      if (previousNodesFormData.length === 0) return undefined;

      const taskIds = previousNodesFormData.map(formData => formData.formData.task_id);
      return taskIds;
    },
    [edges, nodes]
  );

  const toggleAutoSave = useCallback(() => {
    setAutoSave((prev) => !prev);
  }, []);

  const addNode = useCallback(
    (data: {
      id: string;
      type: string;
      position: { x: number; y: number };
      tempSave: boolean;
      data: CustomNodeData;
    }) => {
      const newNode: Node<CustomNodeData> = {
        id: data.id,
        type: data.type,
        position: data.position,
        data: data.data,
      };
      setNodes((prev) => [...prev, newNode]);
    },
    []
  );

  const updatedSelectedNodeId = useCallback(
    (nodeId: string, selectedType: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const selectionId = node.id === nodeId;
          return selectionId
            ? {
              ...node,
              data: {
                ...node.data,
                selectedData: selectedType,
              },
            }
            : node;
        })
      );
    },
    []
  );

  const revertOrSaveData = useCallback(
    (nodeId: string, save: boolean) => {
      if (!save) {
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            const selectionId = node.id === nodeId;
            if (node.data.tempSave) return node; // Return unchanged node if tempSave is true
            return selectionId
              ? {
                ...node,
                data: {
                  ...node.data,
                  selectedData: null,
                },
              }
              : node;
          })
        );
      } else {
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            const selectionId = node.id === nodeId;
            return selectionId
              ? {
                ...node,
                data: {
                  ...node.data,
                  tempSave: true,
                },
              }
              : node;
          })
        );
      }
    },
    [setNodes]
  );

  const setSelectedFlowId = useCallback(
    (flowId: string) => {
      setSelectedFlowIdState(flowId);
    },
    []
  );

  const selectedNodeConnection = useCallback((nodeId: string) => {
    const currentNode = nodes.find((n) => n.id === nodeId);
    if (!currentNode) return null;

    const currentNodeForm = getNodeFormData(nodeId);

    // Previous nodes (incoming edges: those that have `target` = current node)
    const incomingEdges = edges.filter((edge) => edge.target === nodeId);
    const previousNodes = incomingEdges.map((edge) => {
      const prevNode = nodes.find((n) => n.id === edge.source) || null;
      const prevNodeForm = prevNode ? getNodeFormData(prevNode.id) : null;
      return {
        nodeData: prevNode,
        nodeForm: prevNodeForm,
      };
    });

    // Next nodes (outgoing edges: those that have `source` = current node)
    const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
    const nextNodes = outgoingEdges.map((edge) => {
      const nextNode = nodes.find((n) => n.id === edge.target) || null;
      const nextNodeForm = nextNode ? getNodeFormData(nextNode.id) : null;
      return {
        nodeData: nextNode,
        nodeForm: nextNodeForm,
      };
    });

    return {
      selected: {
        nodeData: currentNode,
        nodeForm: currentNodeForm,
      },
      previous: previousNodes,
      next: nextNodes,
    };
  }, [nodes, edges, getNodeFormData]);

  const selectedNodeOptimized = useCallback(
    (nodeId: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? {
              ...node,
              data: {
                ...node.data,
                meta: {
                  ...node.data.meta,
                  fullyOptimized: true,
                },
              },
            }
            : node
        )
      );
    },
    [setNodes]
  );

  const fullFlowOptimizzed = useCallback(() => {
    const allOptimized = nodes.every(node => node?.data?.meta?.fullyOptimized === true);
    return allOptimized
  }, [nodes])

  const debouncedSave = useDebouncedCallback(
    () => {
      if (autoSave && selectedFlowId && isDirty) {
        saveFlow();
        setIsDirty(false);

      }
    },
    6000,
    [autoSave, selectedFlowId, isDirty]
  );

  // Effect to load flow when selectedFlowId changes
  useEffect(() => {
    if (selectedFlowId) {
      const savedFlow = loadFlow(selectedFlowId);
      setNodes(savedFlow ? savedFlow.nodes : []);
      setEdges(savedFlow ? savedFlow.edges : []);
      setNodeFormData(savedFlow ? savedFlow.nodeFormData : []);
      setSelectedNode(null);
      setIsSaved(true);
      setIsSaving(false);
      setIsDirty(false);
    } else {
      // If no flow is selected, reset the state
      setNodes([]);
      setEdges([]);
      setNodeFormData([]);
      setSelectedNode(null);
      setIsSaved(true);
      setIsSaving(false);
      setIsDirty(false);
    }
  }, [selectedFlowId, loadFlow]);

  // Effect for auto-save
  useEffect(() => {
    if (selectedFlowId) {
      setIsDirty(true);
      debouncedSave();
    }
  }, [nodes, edges, debouncedSave, selectedFlowId]);


  const value: FlowContextType = {
    selectedFlowId,
    nodes,
    edges,
    setNodes,
    setEdges,
    isPlaying,
    togglePlayback,
    updateNodeDimensions,
    reactFlowInstance,
    setReactFlowInstance,
    isDataPreviewOpen,
    toggleDataPreview,
    zoomIn,
    zoomOut,
    deleteEdgeBySourceTarget,
    fitView,
    cloneNode,
    deleteSelectedNodes,
    deleteNode,
    renameNode,
    showNodeInfo,
    selectedNode,
    selectNode,
    nodeFormData,
    getNodeFormData,
    prevNodeFn,
    updateNodeFormData,
    isSaving,
    isSaved,
    autoSave,
    editingNode,
    temporaryEdgeId,
    setEditingNode,
    setTemporaryEdgeId,
    toggleAutoSave,
    saveFlow,
    addNode,
    updateNodeMeta,
    setSelectedFlowId,
    updatedSelectedNodeId,
    revertOrSaveData,
    selectedNodeConnection,
    selectedNodeOptimized,
    fullFlowOptimizzed,
    isDirty
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
}
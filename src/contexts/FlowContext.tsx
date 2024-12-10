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

  const {
    deleteNode,
    deleteSelectedNodes,
    cloneNode,
    updateNodeMeta,
    renameNode,
    updateNodeDimensions
  } = useNodeOperations(nodes, setNodes, setEdges);

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
    (nodeId: string): Node<CustomNodeData>[] | undefined => {
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      if (incomingEdges.length === 0) return undefined;
     // debugger
      const sourceNodeIds = incomingEdges.map((edge) => edge.source);
      const previousNodes = nodes.filter((node) =>
        sourceNodeIds.includes(node.id)
      );
      return previousNodes.length > 0 ? previousNodes : undefined;
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

  const debouncedSave = useDebouncedCallback(
    () => {
      if (autoSave && selectedFlowId) {
        saveFlow();
      }
    },
    10000,
    [autoSave, selectedFlowId]
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
    } else {
      // If no flow is selected, reset the state
      setNodes([]);
      setEdges([]);
      setNodeFormData([]);
      setSelectedNode(null);
      setIsSaved(true);
      setIsSaving(false);
    }
  }, [selectedFlowId, loadFlow]);

  // Effect for auto-save
  useEffect(() => {
    debouncedSave();
  }, [nodes, edges, debouncedSave]);

 
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
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Node, Edge, ReactFlowInstance } from "reactflow";
import { LocalStorageService } from "@/services/localStorageServices";
// Interface Definitions
interface ModuleInfo {
  color: string;
  icon: string;
  label: string;
}

interface MetaData {
  type: string;
  moduleInfo: ModuleInfo;
  properties: Record<string, any>;
  description: string;
  [key: string]: any;
}

interface CustomNodeData {
  label: string;
  type: string;
  status: string;
  meta: MetaData;
}

interface NodeFormData {
  nodeId: string;
  formData: Record<string, any>;
}

interface EditingNode {
  id: string;
  label: string;
  content: string;
}

interface FlowContextType {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  isPlaying: boolean;
  isDataPreviewOpen: boolean;
  selectedNode: Node<CustomNodeData> | null;
  nodeFormData: NodeFormData[];
  isSaving: boolean;
  isSaved: boolean;
  autoSave: boolean;
  editingNode: EditingNode | null;
  temporaryEdgeId: string | null;
  setNodes: React.Dispatch<React.SetStateAction<Node<CustomNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  togglePlayback: () => void;
  updateNodeDimensions: (nodeId: string, dimensions: { width: number; height: number }) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  toggleDataPreview: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  deleteNode: (nodeId: string) => void;
  cloneNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newLabel: string) => void;
  showNodeInfo: (nodeId: string) => void;
  selectNode: (nodeId: string) => void;
  updateNodeFormData: (nodeId: string, formData: Record<string, any>) => void;
  getNodeFormData: (nodeId: string) => Record<string, any> | undefined;
  prevNodeFn: (nodeId: string) => Node<CustomNodeData>[] | undefined;
  setEditingNode: (node: EditingNode | null) => void;
  setTemporaryEdgeId: (id: string | null) => void;
  toggleAutoSave: () => void;
  saveFlow: () => Promise<void>;
  addNode: (data: {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: CustomNodeData;
  }) => void;
  updateNodeMeta: (nodeId: string, newMeta: Partial<MetaData>) => void;
}

function debounce<Func extends (...args: any[]) => void>(
  func: Func,
  delay: number
): (...args: Parameters<Func>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<Func>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>(() => {
    const savedFlow = LocalStorageService.getItem('flow');
    return savedFlow ? JSON.parse(savedFlow).nodes : [];
  });

  const [edges, setEdges] = useState<Edge[]>(() => {
    const savedFlow = LocalStorageService.getItem('flow');
    return savedFlow ? JSON.parse(savedFlow).edges : [];
  });

  const [nodeFormData, setNodeFormData] = useState<NodeFormData[]>(() => {
    const savedFlow = LocalStorageService.getItem('flow');
    return savedFlow ? JSON.parse(savedFlow).nodeFormData : [];
  });

  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [editingNode, setEditingNode] = useState<EditingNode | null>(null);
  const [temporaryEdgeId, setTemporaryEdgeId] = useState<string | null>(null);

  if (isPlaying) {
    console.log(nodeFormData.map((formData) => (formData.formData)));
  }
  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleDataPreview = useCallback(() => {
    setIsDataPreviewOpen((prev) => !prev);
  }, []);

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
    []
  );

  const zoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ duration: 500 });
    }
  }, [reactFlowInstance]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setEdges((prevEdges) =>
      prevEdges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    );
  }, []);

  const cloneNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => {
      const nodeToClone = prevNodes.find((node) => node.id === nodeId);
      if (!nodeToClone) return prevNodes;

      const newNode = {
        ...nodeToClone,
        id: `${nodeId}-clone-${Date.now()}`,
        position: {
          x: nodeToClone.position.x + 150,
          y: nodeToClone.position.y,
        },
      };

      return [...prevNodes, newNode];
    });
  }, []);

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
                type: newLabel,
              },
            },
          }
          : node
      )
    );
  }, []);

  const showNodeInfo = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        console.log("Node Info:", node.data.meta);
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

  const updateNodeFormData = useCallback(
    (nodeId: string, formData: Record<string, any>) => {
      setNodeFormData((prevData) => {
        const existingIndex = prevData.findIndex(
          (item) => item.nodeId === nodeId
        );
        if (existingIndex !== -1) {
          const newData = [...prevData];
          newData[existingIndex] = { nodeId, formData };
          return newData;
        }
        return [...prevData, { nodeId, formData }];
      });
    },
    []
  );

  const getNodeFormData = useCallback(
    (nodeId: string) => {
      return nodeFormData.find((item) => item.nodeId === nodeId)?.formData;
    },
    [nodeFormData]
  );

  const prevNodeFn = useCallback(
    (nodeId: string): Node<CustomNodeData>[] | undefined => {
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      if (incomingEdges.length === 0) return undefined;

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

  const saveFlow = useCallback(async () => {
    setIsSaving(true);
    try {
      const flowData = {
        nodes,
        edges,
        nodeFormData
      };
      LocalStorageService.setItem('flow', JSON.stringify(flowData));
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving flow:", error);
      setIsSaved(false);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, nodeFormData]);

  const addNode = useCallback(
    (data: {
      id: string;
      type: string;
      position: { x: number; y: number };
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

  const updateNodeMeta = useCallback(
    (nodeId: string, newMeta: Partial<MetaData>) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? {
              ...node,
              data: {
                ...node.data,
                meta: {
                  ...node.data.meta,
                  ...newMeta,
                },
              },
            }
            : node
        )
      );
    },
    []
  );

  useEffect(() => {
    if (autoSave) {
      const debouncedSave = debounce(saveFlow, 1000);
      debouncedSave();
    }
  }, [nodes, edges, nodeFormData, autoSave, saveFlow]);

  const value = {
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
    fitView,
    cloneNode,
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
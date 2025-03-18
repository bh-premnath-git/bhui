import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Node, Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges, ReactFlowInstance,
  MarkerType
} from 'reactflow';
import {
  FlowContextType,
  CustomNodeData,
  NodeFormData,
  EditingNode,
} from '@/types/designer/flow';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useNodeOperations } from '@/hooks/useNodeOperations';
import { useFlowOperations } from '@/hooks/useFlowOperations';
import { useFormOperations } from '@/hooks/useFormOperations';
import { useModules } from "@/hooks/useModules";
import { LocalStorageService } from '@/lib/localStorageServices';
import { parseStringifiedJson } from '@/lib/object';

const FlowContext = createContext<FlowContextType | undefined>(undefined);

const NODE_SPACING = 120;
const INITIAL_POSITION = { x: 50, y: 140 };

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const [selectedFlowId, setSelectedFlowIdState] = useState<string | null>(() => {
    // Try to get flowId from URL first, then localStorage
    const flowIdFromUrl = location.pathname.match(/\/flow\/(\d+)/)?.[1];
    return flowIdFromUrl || LocalStorageService.getItem('selectedFlowId');
  });

  // Update selectedFlowId when URL changes
  useEffect(() => {
    const flowIdFromUrl = location.pathname.match(/\/flow\/(\d+)/)?.[1];
    if (flowIdFromUrl && flowIdFromUrl !== selectedFlowId) {
      setSelectedFlowIdState(flowIdFromUrl);
    }
  }, [location.pathname]);

  // Persist selectedFlowId to localStorage
  useEffect(() => {
    if (selectedFlowId) {
      LocalStorageService.setItem('selectedFlowId', selectedFlowId);
    }
  }, [selectedFlowId]);

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
  const [formdataNum, setFormDataNum] = useState(0);
  const [aiMissingData, setAiMissingData] = useState({});

  useEffect(() => {
    console.log('selectedFlowId changed:', selectedFlowId);
  }, [selectedFlowId]);

  const [moduleTypes] = useModules();

  const [changeTriggerCount, setChangeTriggerCount] = useState(0);

  const prevNodeFn = useCallback(
    (nodeId: string): string[] | undefined => {
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      if (incomingEdges.length === 0) return undefined;
      const sourceNodeIds = incomingEdges.map((edge) => edge.source);
      const currentNodeformData = LocalStorageService.getItem(`flow-${selectedFlowId}`).nodeFormData;

      const previousNodesFormData = currentNodeformData.filter((formData) =>
        sourceNodeIds.includes(formData.nodeId)
      );
      if (previousNodesFormData.length === 0) return undefined;

      const taskIds = previousNodesFormData.map(formData => formData.formData.task_id);
      return taskIds;
    },
    [edges, nodeFormData]
  );

  const {
    deleteNode,
    deleteSelectedNodes,
    cloneNode,
    updateNodeMeta,
    renameNode,
    updateNodeDimensions
  } = useNodeOperations(nodes, setNodes, setEdges, setSelectedNode, setNodeFormData, setIsSaved);

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
    setIsSaved,
    prevNodeFn
  );

  const clearFlow = useCallback(() => {
    if (selectedFlowId) {
      // Clear localStorage
      LocalStorageService.removeItem(`flow-${selectedFlowId}`);
      
      // Clear application state
      setNodes([]);
      setEdges([]);
      setNodeFormData([]);
      setSelectedNode(null);
      setIsSaved(true);
      setIsDirty(false);
      
      console.log(`Flow ${selectedFlowId} cleared from localStorage and state`);
    }
  }, [selectedFlowId]);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds).map((edge) => ({
        ...edge,
      }))
      );
    },
    [setEdges]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds).map((node) => ({
        ...node,
        data: {
          ...node.data,
        },
      })));
    },
    [setNodes]
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

  const toggleAutoSave = useCallback(() => {
    setAutoSave((prev) => !prev);
  }, []);

  const addNode = useCallback(
    (data: {
      id: string;
      type: string;
      tempSave: boolean;
      data: CustomNodeData;
    }) => {
      setNodes((prevNodes) => {
        const newNode: Node<CustomNodeData> = {
          id: data.id,
          type: data.type,
          position: {
            x: INITIAL_POSITION.x + prevNodes.length * NODE_SPACING,
            y: INITIAL_POSITION.y,
          },
          data: data.data,
        };

        return [...prevNodes, newNode];
      });
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
                type: selectedType,
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
            if (node.data.tempSave) return node;
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

  const selectedNodeConnection = useCallback(
    (nodeId: string) => {
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
    },
    [nodes, edges, getNodeFormData]
  );

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
    const allOptimized = nodes.every(
      (node) => node?.data?.meta?.fullyOptimized === true
    );
    return allOptimized;
  }, [nodes]);

  // Update node dependencies when edges change
  const updateNodeDependencies = useCallback(() => {
    if (!selectedFlowId) return;

    setNodeFormData(currentFormData => {
      const updatedFormData = [...currentFormData];

      // Create a map of nodeId to task_id for quick lookup
      const nodeToTaskIdMap = new Map();
      currentFormData.forEach(item => {
        if (item.formData.task_id) {
          nodeToTaskIdMap.set(item.nodeId, item.formData.task_id);
        }
      });

      // First, reset all dependsOn arrays
      updatedFormData.forEach(item => {
        if (item.formData && item.formData.dependsOn) {
          item.formData.dependsOn = [];
        }
      });

      // Then update each node's dependencies based on incoming edges
      edges.forEach(edge => {
        const targetNodeIndex = updatedFormData.findIndex(item => item.nodeId === edge.target);
        if (targetNodeIndex !== -1) {
          const sourceTaskId = nodeToTaskIdMap.get(edge.source);
          if (sourceTaskId) {
            // Ensure we have a formData object
            if (!updatedFormData[targetNodeIndex].formData) {
              updatedFormData[targetNodeIndex].formData = {};
            }

            // Ensure we have a dependsOn array
            if (!updatedFormData[targetNodeIndex].formData.dependsOn) {
              updatedFormData[targetNodeIndex].formData.dependsOn = [];
            }

            // Add the dependency if it doesn't exist already
            const dependsOn = updatedFormData[targetNodeIndex].formData.dependsOn;
            if (!dependsOn.includes(sourceTaskId)) {
              updatedFormData[targetNodeIndex].formData.dependsOn = [...dependsOn, sourceTaskId];
            }
          }
        }
      });

      return updatedFormData;
    });

  }, [selectedFlowId, edges, setNodeFormData]);

  // Call updateNodeDependencies whenever edges change
  useEffect(() => {
    if (selectedFlowId) {
      updateNodeDependencies();
    }
  }, [edges, selectedFlowId, updateNodeDependencies]);

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

  const setAiflowStrructre = useCallback(
    (data: string) => {
      try {
        setNodes([]);
        setEdges([]);
        setNodeFormData([]);
        const parsedValue = parseStringifiedJson(data.replace(/```json\n|\n```/g, ''))
         if (parsedValue[0]) {
          const valData: any = parsedValue[1];
          if (!Array.isArray(valData.tasks)) return;

          const edgesToAdd: Edge[] = [];

          valData.tasks.forEach((task: any, index: number) => {
            const matchedModule = moduleTypes.find(
              (module) => module.label === task.module_name
            );
            const matchedOperator = matchedModule?.operators.find(
              (op: any) => op.type === task.type
            );

            const nodeId = `task-${task.task_id ?? index}`;

            addNode({
              id: nodeId,
              type: 'custom',
              data: {
                tempSave: true,
                label: matchedModule?.label,
                selectedData: matchedOperator?.type,
                type: matchedOperator?.type,
                status: 'pending',
                meta: {
                  type: matchedOperator?.type,
                  moduleInfo: {
                    color: matchedModule?.color,
                    icon: matchedModule?.icon,
                    label: matchedModule?.label,
                  },
                  properties: matchedOperator?.properties,
                  description: matchedOperator?.description,
                  fullyOptimized: false,
                },
                requiredFields: matchedOperator?.requiredFields || [],
              },
              tempSave: true,
            });

            updateNodeFormData(nodeId, {
              ...task,
            });

            if (index > 0) {
              const sourceId = `task-${valData.tasks[index - 1].task_id ?? index - 1}`;
              console.log("sourceId", sourceId);
              const targetId = nodeId;
              edgesToAdd.push({
                id: `e${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
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
              });
            }
          });

          setEdges((prevEdges) => [...prevEdges, ...edgesToAdd]);
          setTimeout(() => saveFlow(), 0);
        }
      } catch (err) {
        console.error("err", err);

        return
      }
    },
    [addNode, edges, moduleTypes, nodes, setEdges, updateNodeMeta, saveFlow]
  );



  const setConsequentTaskDetail = (task: any, detail: any) => {
  }


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
      setNodes([]);
      setEdges([]);
      setNodeFormData([]);
      setSelectedNode(null);
      setIsSaved(true);
      setIsSaving(false);
      setIsDirty(false);
    }
  }, [selectedFlowId, loadFlow]);

  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);
  const prevFormDataRef = useRef(nodeFormData);

  useEffect(() => {
    if (selectedFlowId && changeTriggerCount < 2) {
      // Check if there are actual changes before logging
      const nodesChanged = JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes);
      const edgesChanged = JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges);
      const formDataChanged = JSON.stringify(prevFormDataRef.current) !== JSON.stringify(nodeFormData);

      if (nodesChanged || edgesChanged || formDataChanged) {
        setIsDirty(true);
        setChangeTriggerCount((prev) => prev + 1);
        if (autoSave) {
          console.log("modification", { flowId: selectedFlowId });
        }
        prevNodesRef.current = nodes;
        prevEdgesRef.current = edges;
        prevFormDataRef.current = nodeFormData;
        debouncedSave();
      }
    }
  }, [nodes, edges, nodeFormData, selectedFlowId, debouncedSave, changeTriggerCount, autoSave]);

  useEffect(() => {
    if (changeTriggerCount >= 2) {
      const timer = setTimeout(() => setChangeTriggerCount(0), 6000);
      return () => clearTimeout(timer);
    }
  }, [changeTriggerCount]);

  const value: FlowContextType = {
    selectedFlowId,
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
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
    setSelectedFlowId: setSelectedFlowIdState,
    updatedSelectedNodeId,
    revertOrSaveData,
    selectedNodeConnection,
    selectedNodeOptimized,
    fullFlowOptimizzed,
    isDirty,
    formdataNum,
    setFormDataNum,
    setAiflowStrructre,
    setConsequentTaskDetail,
    aiMissingData,
    setAiMissingData,
    updateNodeDependencies,
    clearFlow
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

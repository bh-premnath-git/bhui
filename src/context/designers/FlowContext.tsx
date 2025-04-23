import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { setSelectedFlow } from '@/store/slices/designer/flowSlice';
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
  const dispatch = useAppDispatch();

  const [selectedFlowId, setSelectedFlowIdState] = useState<string | null>(() => {
    // Try to get flowId from URL first, then localStorage
    const flowIdFromUrl = location.pathname.match(/\/flow\/(\d+)/)?.[1];
    return flowIdFromUrl || LocalStorageService.getItem('selectedFlowId') || null;
  });

  // Update selectedFlowId when URL changes and reset states when navigating to manage-flow
  useEffect(() => {
    const flowIdFromUrl = location.pathname.match(/\/flow\/(\d+)/)?.[1];
    
    // Check if we've navigated to the manage-flow route
    if (location.pathname.includes('designers/manage-flow')) {
      // Reset all flow-related states
      setSelectedFlowIdState(null);
      setNodes([]);
      setEdges([]);
      setNodeFormData([]);
      setSelectedNode(null);
      setIsSaved(true);
      setIsSaving(false);
      setIsDirty(false);
      setHasFlowConfig(false);
      setFlowPipeline(null);
      
      // IMPORTANT: Also reset the selectedFlow in Redux
      dispatch(setSelectedFlow(null));
    } 
    // If there's a flow ID in the URL and it's different from current, update it
    else if (flowIdFromUrl && flowIdFromUrl !== selectedFlowId) {
      setSelectedFlowIdState(flowIdFromUrl);
    }
  }, [location.pathname, dispatch]);

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
  const [hasFlowConfig, setHasFlowConfig] = useState(false);
  const [flowPipeline, setFlowPipeline] = useState<any | null>(null);
  
  // Add lastPipelineRef to keep track of the last non-null pipeline
  const lastPipelineRef = useRef<any>(null);

  // Add flowConfigMap state
  const [flowConfigMap, setFlowConfigMap] = useState<Record<string, any>>({});

  // Import the RootState and useAppSelector for accessing the Redux store
  const { selectedFlow } = useAppSelector((state: RootState) => state.flow);

  // Improved getPipelineDetails function with better null handling
  const getPipelineDetails = useCallback((pipelineName: string | null) => {
    // Log for debugging
    console.log('getPipelineDetails called with:', pipelineName);
    console.log('Current flowPipeline:', flowPipeline);
    console.log('Current lastPipelineRef.current:', lastPipelineRef.current);

    // For the special loading value, return null without updating the ref
    if (pipelineName === 'load_pipeline_data') {
      return null;
    }

    // If a specific pipeline name is provided and we have pipeline data
    if (pipelineName && flowPipeline && Array.isArray(flowPipeline)) {
      // Find the matching pipeline 
      const found = flowPipeline.find((p: any) => p.pipeline_name === pipelineName) ?? null;
      
      // If found, update the ref and return
      if (found) {
        console.log('Found pipeline details:', found);
        lastPipelineRef.current = found;
        return found;
      }
    }
    
    // Special case: if looking for null (latest pipeline) but flowPipeline has changed and has items
    // First check if flowPipeline has items but is different from last ref
    if (pipelineName === null && 
        flowPipeline && 
        Array.isArray(flowPipeline) && 
        flowPipeline.length > 0) {
      
      // Check if we need to update the reference
      if (!lastPipelineRef.current || 
          !flowPipeline.some((p: any) => p.pipeline_id === lastPipelineRef.current?.pipeline_id)) {
        console.log('Updating lastPipelineRef to first pipeline in list');
        lastPipelineRef.current = flowPipeline[0];
      }
    }

    // Return the saved reference
    return lastPipelineRef.current;
  }, [flowPipeline]);

  // Update the hasFlowConfig effect to use flowConfigMap
  useEffect(() => {
    // Skip this effect if there's no selectedFlowId
    if (!selectedFlowId) {
      setHasFlowConfig(false);
      return;
    }
    
    // Get the config status from the map, default to false if not found
    const hasConfig = flowConfigMap[selectedFlowId] || false;
    
    // Only update flow config information if we have selected flow data
    if (selectedFlow?.flow_config?.[0]?.flow_config) {
      const newConfig = selectedFlow.flow_config[0].flow_config;
      
      // Compare to see if this is actually a change to avoid unnecessary updates
      if (JSON.stringify(flowConfigMap.flowconfig) !== JSON.stringify(newConfig)) {
        setFlowConfigMap(prev => ({
          ...prev,
          flowconfig: newConfig
        }));
      }
    }
    
    setHasFlowConfig(hasConfig);
  }, [selectedFlowId, selectedFlow]);  // Removed flowConfigMap from dependencies


  const [moduleTypes] = useModules();

  const [changeTriggerCount, setChangeTriggerCount] = useState(0);
  const isUpdatingDependencies = useRef(false); // Add ref to track dependency update state

  const prevNodeFn = useCallback(
    (nodeId: string): string[] | undefined => {
      if (!selectedFlowId) return undefined;
      
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      if (incomingEdges.length === 0) return undefined;
      const sourceNodeIds = incomingEdges.map((edge) => edge.source);
      
      // Safely check if flow data exists in localStorage
      const savedFlowData = LocalStorageService.getItem(`flow-${selectedFlowId}`);
      if (!savedFlowData || !savedFlowData.nodeFormData) return undefined;
      
      const currentNodeformData = savedFlowData.nodeFormData;

      const previousNodesFormData = currentNodeformData.filter((formData) =>
        sourceNodeIds.includes(formData.nodeId)
      );
      if (previousNodesFormData.length === 0) return undefined;

      const taskIds = previousNodesFormData.map(formData => formData.formData.task_id).filter(Boolean);
      return taskIds.length > 0 ? taskIds : undefined;
    },
    [edges, selectedFlowId]
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

  // Update node dependencies when edges change - with flow ID safety check
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

  // Call updateNodeDependencies whenever edges change - with safeguards
  useEffect(() => {
    // Skip if there's no selectedFlowId or if we're already processing
    if (!selectedFlowId || isUpdatingDependencies.current) return;
    
    // This prevents the effect from running recursively
    isUpdatingDependencies.current = true;
    
    try {
      updateNodeDependencies();
    } finally {
      // Reset the flag after execution is done
      isUpdatingDependencies.current = false;
    }
  }, [edges, selectedFlowId, updateNodeDependencies]);

  const debouncedSave = useDebouncedCallback(
    () => {
      if (autoSave && selectedFlowId && isDirty) {        saveFlow();
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


  // Added effect to handle flow data loading
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
      
      // Explicitly set hasFlowConfig to false when loading a new flow
      // This ensures we start from a clean state for the new flow
      setHasFlowConfig(false);
      setFlowPipeline(null);
    } else {
      setNodes([]);
      setEdges([]);
      setNodeFormData([]);
      setSelectedNode(null);
      setIsSaved(true);
      setIsSaving(false);
      setIsDirty(false);
      setHasFlowConfig(false);
      setFlowPipeline(null);
    }
  }, [selectedFlowId, loadFlow]);

  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);
  const prevFormDataRef = useRef(nodeFormData);

  // Track changes to nodes, edges, and formData with safeguards against infinite loops
  useEffect(() => {
    // Skip if no selectedFlowId or if we're already at our change limit
    if (!selectedFlowId || changeTriggerCount >= 2) return;
    
    // Use refs to compare previous and current values without causing re-renders
    const nodesChanged = JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes);
    const edgesChanged = JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges);
    const formDataChanged = JSON.stringify(prevFormDataRef.current) !== JSON.stringify(nodeFormData);

    // Only trigger updates if something actually changed
    if (nodesChanged || edgesChanged || formDataChanged) {
      setIsDirty(true); 
      setChangeTriggerCount((prev) => prev + 1);
      
      // Update our references to current state
      prevNodesRef.current = [...nodes];
      prevEdgesRef.current = [...edges];
      prevFormDataRef.current = [...nodeFormData];
      
      // Only save if autoSave is enabled
      if (autoSave) {
        console.log("modification", { flowId: selectedFlowId });
        debouncedSave();
      }
    }
  }, [nodes, edges, nodeFormData, selectedFlowId, autoSave, debouncedSave]);

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
    clearFlow,
    hasFlowConfig,
    flowConfigMap,
    flowPipeline,
    setFlowPipeline,
    getPipelineDetails,
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
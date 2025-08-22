import { useCallback } from 'react';
import { ReactFlowInstance, Node, Edge } from '@xyflow/react';
import { LocalStorageService } from '@/lib/localStorageServices';
import { CustomNodeData, NodeFormData } from '@/types/designer/flow';

const isValidFlowId = (flowId: string | null | undefined): flowId is string => {
  return typeof flowId === 'string' && flowId.trim().length > 0;
};

export function useFlowOperations(
  reactFlowInstance: ReactFlowInstance | null,
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  nodeFormData: NodeFormData[],
  selectedFlowId: string | null,
  setIsSaving: (value: boolean) => void,
  setIsSaved: (value: boolean) => void,
  prevNodeFn: (nodeId: string) => string[] | undefined
) {
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

  const saveFlow = useCallback(async () => {
    if (!isValidFlowId(selectedFlowId)) {
      console.warn("Invalid or missing flow ID. Cannot save.", { selectedFlowId });
      return;
    }
    
    // Log the flow being saved to help with debugging
    console.log(`Saving flow with ID: ${selectedFlowId}`);
    
    setIsSaving(true);
    try {
      const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
      const sortedNodeFormData = sortedNodes.map((node) => {
        const matchFormData =
          nodeFormData.find((f) => f.nodeId === node.id) ||
          { nodeId: node.id, formData: {} };
        const updatedFormData = { ...matchFormData.formData };
        const task_id = node.data.meta.renameType ?? updatedFormData.task_id;
        updatedFormData.task_id = task_id;

        const type = node.data.selectedData;
        updatedFormData.type = type

        const depends_on = prevNodeFn(matchFormData.nodeId)?.map(node => node) ?? [];
        updatedFormData.depends_on = depends_on;

        return { ...matchFormData, formData: updatedFormData };
      });
      const flowData = {
        nodes: sortedNodes,
        edges,
        nodeFormData: sortedNodeFormData,
        flowConfigs: LocalStorageService.getItem(`flow-${selectedFlowId}`)?.flowConfigs || [],
      };
      
      // Double-check we're saving to the correct flow ID
      const currentFlowId = selectedFlowId;
      LocalStorageService.setItem(`flow-${currentFlowId}`, flowData);
      
      await new Promise((resolve) => setTimeout(resolve, 0));
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving flow:", error);
      setIsSaved(false);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, nodeFormData, selectedFlowId, setIsSaving, setIsSaved]);

  const loadFlow = useCallback((flowId: string | null | undefined) => {
    // Validate flowId before attempting to load
    if (!isValidFlowId(flowId)) {
      console.warn("Invalid or missing flow ID. Cannot load flow.", { flowId });
      return null;
    }

    // Log the flow being loaded to help with debugging
    console.log(`Loading flow with ID: ${flowId}`);
    
    try {
      // Ensure we're using the explicitly passed flowId, not the closure value
      const savedFlow = LocalStorageService.getItem(`flow-${flowId}`);
      return savedFlow;
    } catch (error) {
      console.error("Error loading flow from localStorage:", { flowId, error });
      return null;
    }
  }, []);

  return {
    zoomIn,
    zoomOut,
    fitView,
    saveFlow,
    loadFlow
  };
}
import { useCallback } from 'react';
import { ReactFlowInstance, Node, Edge } from 'reactflow';
import { LocalStorageService } from '@/services/localStorageServices';
import { CustomNodeData, NodeFormData } from '@/types/flow';

export function useFlowOperations(
  reactFlowInstance: ReactFlowInstance | null,
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  nodeFormData: NodeFormData[],
  selectedFlowId: string | null,
  setIsSaving: (value: boolean) => void,
  setIsSaved: (value: boolean) => void
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
    if (!selectedFlowId) {
      console.warn("No flow selected. Cannot save.");
      return;
    }
    setIsSaving(true);
    try {
      const flowData = {
        nodes,
        edges,
        nodeFormData,
      };
      LocalStorageService.setItem(`flow-${selectedFlowId}`, flowData);
      await new Promise((resolve) => setTimeout(resolve, 0));
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving flow:", error);
      setIsSaved(false);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, nodeFormData, selectedFlowId, setIsSaving, setIsSaved]);

  const loadFlow = useCallback((flowId: string) => {
    const savedFlow = LocalStorageService.getItem(`flow-${flowId}`);
    return savedFlow;
  }, []);

  return {
    zoomIn,
    zoomOut,
    fitView,
    saveFlow,
    loadFlow
  };
}
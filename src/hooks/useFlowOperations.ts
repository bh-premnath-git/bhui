import { useCallback } from 'react';
import { ReactFlowInstance, Node, Edge } from 'reactflow';
import { LocalStorageService } from '@/services/localStorageServices';
import { CustomNodeData, NodeFormData } from '@/types/designer/flow';

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
    if (!selectedFlowId) {
      console.warn("No flow selected. Cannot save.");
      return;
    }
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

        const dependsOn = prevNodeFn(matchFormData.nodeId)?.map(node => node) ?? [];
        updatedFormData.dependsOn = dependsOn;

        return { ...matchFormData, formData: updatedFormData };
      });
      const flowData = {
        nodes: sortedNodes,
        edges,
        nodeFormData: sortedNodeFormData,
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
import { useCallback } from "react";

interface UseNodeFormInputProps {
  selectedNode: any;
  currentFormData: Record<string, any>;
  dependsOn: any;
  updateNodeFormData: (nodeId: string, formData: Record<string, any>) => void;
  saveFlow: () => void;
  taskID: string;
}

export function useNodeFormInput({
  selectedNode,
  currentFormData,
  dependsOn,
  updateNodeFormData,
  saveFlow,
  taskID,
}: UseNodeFormInputProps) {
    
  const handleInputChange = useCallback(
    (key: string, value: string) => {
      if (!selectedNode) return;
      
      updateNodeFormData(selectedNode.id, {
        ...currentFormData,
        task_id: taskID,
        [key]: value,
      });
      
      saveFlow();
    },
    [selectedNode, currentFormData, dependsOn, updateNodeFormData, saveFlow, taskID]
  );

  return handleInputChange;
}
